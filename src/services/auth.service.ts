import bcrypt from 'bcryptjs';
import User from '../models/User';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  return bcrypt.compare(password, hashedPassword);
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};
