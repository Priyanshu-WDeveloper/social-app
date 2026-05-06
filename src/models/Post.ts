import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    text: {
      type: String,
    },

    media: [String],

    visibility: {
      type: String,
      default: 'public',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Post', postSchema);
