import { Request, Response } from 'express';
import Post from '../models/Post';
import imagekit from '../config/imagekit';
import { ENV } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

// export const uploadMedia = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file provided' });
//     }

//     // Convert buffer to base64
//     const base64 = req.file.buffer.toString('base64');
//     const dataUri = `data:${req.file.mimetype};base64,${base64}`;

//     const response = await imagekit.upload({
//       file: dataUri,
//       fileName: req.file.originalname,
//       useUniqueFileName: true,
//     });

//     return res.status(200).json(response);
//   } catch (error: any) {
//     console.error(
//       'ImageKit upload error full:',
//       JSON.stringify(error, null, 2),
//     );
//     return res.status(500).json({ message: 'Upload failed' });
//   }
// };
// export const createPost = async (req: Request, res: Response) => {
//   try {
//     const {
//       content = '',
//       media = [],
//       visibility = 'public',
//     } = req.body;

//     if (typeof content !== 'string' || !Array.isArray(media)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid payload',
//       });
//     }

//     const trimmedContent = content.trim();

//     if (!trimmedContent && media.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Post must contain text or media',
//       });
//     }

//     if (media.length > 10) {
//       return res.status(400).json({
//         success: false,
//         message: 'Maximum 10 media files allowed',
//       });
//     }

//     const verifiedMedia = await Promise.all(
//       media.map(async (item: any) => {
//         try {
//           const fileDetails = await imagekit.getFileDetails(
//             item.fileId,
//           );

//           return {
//             id: item.id,
//             fileId: item.fileId,
//             url: fileDetails.url,
//             thumbnailUrl: fileDetails.thumbnail || '',
//             type: item.type,
//             width: fileDetails.width || null,
//             height: fileDetails.height || null,
//             size: fileDetails.size || 0,
//             mimeType: fileDetails.mime || '',
//             provider: 'imagekit',
//           };
//         } catch {
//           return null;
//         }
//       }),
//     );
//     const sanitizedMedia = verifiedMedia.filter(Boolean);

//     const post = await Post.create({
//       user: req.user?.id,
//       content: trimmedContent,
//       media: sanitizedMedia,
//       visibility,
//     });

//     const populatedPost = await Post.findById(post._id).populate(
//       'user',
//       'fullName username profilePicture',
//     );

//     return res.status(201).json({
//       success: true,
//       message: 'Post created successfully',
//       post: populatedPost,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: 'Unable to create post',
//     });
//   }
// };

export const createPost = async (req: Request, res: Response) => {
  try {
    const content = req.body.content || '';

    const files = req.files as Express.Multer.File[];

    const media =
      files?.map((file) => ({
        id: file.filename,

        fileId: file.filename,

        url: `${ENV.CLIENT_URL}/uploads/${file.filename}`,

        thumbnailUrl: '',

        type: file.mimetype.startsWith('video') ? 'video' : 'image',

        mimeType: file.mimetype,

        width: 0,

        height: 0,

        size: file.size,

        provider: 'local',
      })) || [];

    if (!content && media.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post must contain text or media',
      });
    }

    const post = await Post.create({
      user: req.user?.id,
      content,
      media,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'fullName username profilePicture',
    );

    return res.status(201).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Unable to create post',
    });
  }
};
export const getPosts = async (_req: Request, res: Response) => {
  const posts = await Post.find()
    .populate('user', 'fullName username email')
    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    success: true,

    count: posts.length,

    posts,
  });
};
