import express from 'express';
import {
  createPost,
  getImageKitAuth,
  getPosts,
} from '../controllers/post.controller';
import { protect } from '../middleware/auth.middleware';
import multer from 'multer';
import { uploadMedia } from '../controllers/post.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getPosts);
// router.get('/upload', protect, getImageKitAuth);
router.post(
  '/img-upload',
  protect,
  upload.single('file'),
  uploadMedia,
);
router.post('/upload', protect, createPost);

export default router;
