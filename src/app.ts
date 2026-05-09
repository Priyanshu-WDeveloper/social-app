import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';
import { ENV } from './config/env';

const app = express();

app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads')),
);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
export default app;
