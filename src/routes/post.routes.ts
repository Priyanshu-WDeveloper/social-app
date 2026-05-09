import express from 'express';
import {
  createPost,
  getImageKitAuth,
  getPosts,
  uploadMedia,
} from '../controllers/post.controller';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware';
import upload from '../config/multer';

const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getPosts);
// router.get('/upload', protect, getImageKitAuth);
// router.post(
//   '/img-upload',
//   protect,
//   upload.single('file'),
//   uploadMedia,
// );

router.post(
  '/upload',
  upload.array('media', 10),
  protect,
  createPost,
);

// router.post('/upload', protect, createPost);

export default router;
