import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    fileId: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      default: '',
    },

    type: {
      type: String,
      enum: ['image', 'video', 'gif'],
      required: true,
    },

    mimeType: {
      type: String,
      default: '',
    },

    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    size: {
      type: Number,
      default: 0,
    },

    duration: {
      type: Number,
      default: null,
    },

    provider: {
      type: String,
      enum: ['imagekit'],
      default: 'imagekit',
    },
  },
  {
    _id: false,
  },
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: '',
    },

    media: {
      type: [mediaSchema],
      default: [],
      validate: {
        validator: (arr: unknown[]) => arr.length <= 10,
        message: 'Maximum 10 media files allowed',
      },
    },

    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    sharesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Post', postSchema);
