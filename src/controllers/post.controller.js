import Post from '../models/Post';
export const createPost = async (req, res) => {
    const { text, media, visibility } = req.body;
    if (!text && !media?.length) {
        return res.status(400).json({
            message: 'Post must contain text or media',
        });
    }
    const post = await Post.create({
        user: req.user?.id,
        text,
        media,
        visibility: visibility || 'public',
    });
    const populatedPost = await Post.findById(post._id).populate('user', 'fullName username email');
    res.status(201).json({
        success: true,
        message: 'Post created successfully',
        post: populatedPost,
    });
};
export const getPosts = async (_req, res) => {
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
