import User from '../models/User';
import Post from '../models/Post';
export const getUsers = async (_req, res) => {
    const users = await User.find()
        .select('-password -otp -otpExpire')
        .sort({
        createdAt: -1,
    });
    res.status(200).json({
        success: true,
        count: users.length,
        users,
    });
};
export const getUser = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpire');
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }
    const posts = await Post.find({
        user: user._id,
    })
        .sort({
        createdAt: -1,
    })
        .populate('user', 'fullName username email');
    res.status(200).json({
        success: true,
        user,
        posts,
    });
};
