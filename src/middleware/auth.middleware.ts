import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    let token = req.cookies?.token;

    if (!token && authHeader) {
      const [scheme, value] = authHeader.split(' ');
      if (scheme === 'Bearer' || scheme === 'Token') {
        token = value;
      }
    }

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    console.log('Token', token);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    console.log('Decoded', decoded);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
};
