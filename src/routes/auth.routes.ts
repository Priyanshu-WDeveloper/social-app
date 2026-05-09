import express from 'express';
import {
  forgotPassword,
  googleAuth,
  login,
  logout,
  register,
  resetPassword,
  verifyOtp,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router = express.Router();

router.post('/google', googleAuth);

router.post('/register', register);
router.post('/verify-otp', verifyOtp);

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.post('/logout', logout);

export default router;
