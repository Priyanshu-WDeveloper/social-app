import { Request, Response } from 'express';
import Post from '../models/Post';
import imagekit from '../config/imagekit';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

// export const getImageKitAuth = async (
//   req: Request,
//   res: Response,
// ) => {
//   console.log('Reached');

//   try {
//     const auth = imagekit.getAuthenticationParameters();

//     return res.status(200).json(auth);
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: 'Unable to generate upload auth',
//     });
//   }
// };
// export const getImageKitAuth = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     console.log(' Reached============');

//     const auth = imagekit.getAuthenticationParameters();
//     return res.status(200).json(auth);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: 'Unable to generate upload auth',
//     });
//   }
// };

// export const uploadMedia = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file provided' });
//     }
//     console.log(
//       '\n===================== 🟢 file =====================',
//     );
//     console.log(req.file);
//     console.log(
//       '=================================================\n',
//     );
//     // Log what we're sending
//     console.log('File received:', {
//       originalname: req.file.originalname,
//       mimetype: req.file.mimetype,
//       size: req.file.size,
//       bufferLength: req.file.buffer?.length,
//     });
//     console.log('ImageKit config:', {
//       publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
//       privateKeySet: !!process.env.IMAGEKIT_PRIVATE_KEY,
//       urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
//     });
//     const response = await imagekit.upload({
//       file: req.file.buffer,
//       fileName: req.file.originalname,
//       useUniqueFileName: true,
//     });
//     console.log(
//       '\n===================== 🟢 res =====================',
//     );
//     console.log(response);
//     console.log(
//       '=================================================\n',
//     );
//     return res.status(200).json(response);
//   } catch (error) {
//     console.error(
//       'ImageKit upload error full:',
//       JSON.stringify(error, null, 2),
//     );
//     return res.status(500).json({ message: 'Upload failed' });
//   }
// };
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Convert buffer to base64
    const base64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const response = await imagekit.upload({
      file: dataUri,
      fileName: req.file.originalname,
      useUniqueFileName: true,
    });

    return res.status(200).json(response);
  } catch (error: any) {
    console.error(
      'ImageKit upload error full:',
      JSON.stringify(error, null, 2),
    );
    return res.status(500).json({ message: 'Upload failed' });
  }
};
export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      content = '',
      media = [],
      visibility = 'public',
    } = req.body;

    if (typeof content !== 'string' || !Array.isArray(media)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload',
      });
    }

    const trimmedContent = content.trim();

    if (!trimmedContent && media.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post must contain text or media',
      });
    }

    if (media.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 media files allowed',
      });
    }

    const verifiedMedia = await Promise.all(
      media.map(async (item: any) => {
        try {
          const fileDetails = await imagekit.getFileDetails(
            item.fileId,
          );

          return {
            id: item.id,
            fileId: item.fileId,
            url: fileDetails.url,
            thumbnailUrl: fileDetails.thumbnail || '',
            type: item.type,
            width: fileDetails.width || null,
            height: fileDetails.height || null,
            size: fileDetails.size || 0,
            mimeType: fileDetails.mime || '',
            provider: 'imagekit',
          };
        } catch {
          return null;
        }
      }),
    );
    const sanitizedMedia = verifiedMedia.filter(Boolean);

    const post = await Post.create({
      user: req.user?.id,
      content: trimmedContent,
      media: sanitizedMedia,
      visibility,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'fullName username profilePicture',
    );

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
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
