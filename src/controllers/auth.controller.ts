import { Request, Response } from 'express';
import * as crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import {
  comparePassword,
  hashPassword,
} from '../services/auth.service';
import { ENV } from '../config/env';
import resetPasswordTemplate from '../templates/resetPasswordTemplate';
import otpTemplate from '../templates/otpTemplate';
import admin from '../config/firebase-admin';

// export const googleAuth = async (req, res) => {
//   try {
//     const { token } = req.body;

//     const decoded = await admin.auth().verifyIdToken(token);

//     const { email, name, picture, uid } = decoded;

//     if (!email) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid Firebase token',
//       });
//     }

//     let user = await User.findOne({ email });

//     const username =
//       email.split('@')[0] + Math.floor(Math.random() * 1000);

//     if (!user) {
//       user = await User.create({
//         fullName: name,
//         email,
//         username,
//         profilePicture: picture,
//         firebaseUid: uid,
//       });
//     }

//     const jwtToken = generateToken(String(user._id));

//     res.cookie('token', jwtToken, {
//       httpOnly: true,
//       secure: false,
//       sameSite: 'lax',
//     });

//     return res.json({
//       success: true,
//       user,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(401).json({
//       success: false,
//       message: 'Invalid Firebase token',
//     });
//   }
// };

export const OAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    const email = decoded.email || `${decoded.uid}@firebase.local`;

    const name = decoded.name || 'Firebase User';

    const picture = decoded.picture || '';

    let user = await User.findOne({ email });

    if (!user) {
      const baseUsername = email
        .split('@')[0]
        .replace(/[^a-zA-Z0-9_]/g, '');

      const username =
        baseUsername + Math.floor(Math.random() * 10000);

      user = await User.create({
        fullName: name,
        email,
        username,
        profilePicture: picture,
        firebaseUid: decoded.uid,
      });
    }

    const jwtToken = generateToken(String(user._id));

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: 'Invalid Firebase token',
    });
  }
};
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, username, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      // If user exists but is not verified and OTP has expired, allow re-registration
      if (
        !existingUser.isVerified &&
        existingUser.otpExpire &&
        existingUser.otpExpire.getTime() < Date.now()
      ) {
        await User.findByIdAndDelete(existingUser._id);
      } else if (existingUser.isVerified) {
        return res.status(400).json({
          message: 'User already exists',
        });
      } else {
        return res.status(400).json({
          message:
            'User already registered. Please verify your OTP or wait for it to expire.',
        });
      }
    }
    const otp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const hashedPassword = await hashPassword(password);
    // const hashedOtp = await hashPassword(otp);

    const user = await User.create({
      fullName,
      email,
      username,
      password: hashedPassword,
      otp,
      otpExpire: new Date(Date.now() + 5 * 60 * 1000),
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: ENV.EMAIL_USER,
        to: email,
        subject: 'Verify your account',
        html: otpTemplate(fullName, otp),
      });
    } catch (mailError) {
      console.error('OTP email failed:', mailError);
      // Log OTP to console for development
      console.log(`📧 Development: OTP for ${email} is: ${otp}`);
    }

    res.status(201).json({
      message: 'OTP sent successfully',
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  if (!user.otpExpire || user.otpExpire.getTime() < Date.now()) {
    return res.status(400).json({
      message: 'OTP expired',
    });
  }

  if (!user.otp) {
    return res.status(400).json({
      message: 'OTP not set',
    });
  }

  // const isMatch = await comparePassword(otp, user.otp);
  const isMatch = user.otp === otp;

  if (!isMatch) {
    return res.status(400).json({
      message: 'Invalid OTP',
    });
  }

  user.isVerified = true;

  user.otp = undefined;
  user.otpExpire = undefined;

  await user.save();

  res.status(200).json({
    message: 'Account verified successfully',
  });
};

export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    });
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      message: 'Invalid credentials',
    });
  }
  const token = generateToken(user.id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, ...userData } = user.toObject();

  res.status(200).json({
    message: 'Login successful',
    user: userData,
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  const resetUrl = `${ENV.resetPasswordPath}${resetToken}`;
  console.log(resetToken);

  console.log(ENV.EMAIL_PASS, ENV.EMAIL_USER);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: ENV.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset',
      html: resetPasswordTemplate(resetUrl, user.fullName),
    });
  } catch (mailError) {
    console.error('Password reset email failed:', mailError);
  }

  res.status(200).json({
    message: 'Reset email sent',
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  console.log('Token', req.params.token);

  const token = Array.isArray(req.params.token)
    ? req.params.token[0]
    : req.params.token;

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  console.log('HashedToken', hashedToken);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return res.status(400).json({
      message: 'Invalid or expired token',
    });
  }

  const hashedPassword = await hashPassword(req.body.password);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    message: 'Password reset successful',
  });
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  });

  res.status(200).json({
    message: 'Logout successful',
  });
};
