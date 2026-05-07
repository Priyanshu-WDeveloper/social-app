import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import { ENV } from './config/env';
dotenv.config();
connectDB();
const PORT = ENV.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
