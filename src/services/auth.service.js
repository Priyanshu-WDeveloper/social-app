import bcrypt from 'bcryptjs';
import User from '../models/User';
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};
export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};
