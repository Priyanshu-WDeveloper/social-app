import express from 'express';
import { createPost, getPosts } from '../controllers/post.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/upload', protect, createPost);
router.get('/', getPosts);

export default router;
