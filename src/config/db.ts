import mongoose from 'mongoose';
import { ENV } from './env';

const connectDB = async () => {
  try {
    await mongoose.connect(ENV.mongoUri as string);

    console.log('MongoDB connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
