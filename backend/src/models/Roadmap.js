const mongoose = require('mongoose');
const { DIFFICULTY_LEVELS } = require('../utils/constants');

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, required: true },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technologies: [{ type: String, trim: true }],
    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY_LEVELS),
      default: DIFFICULTY_LEVELS.BEGINNER,
    },
    duration: {
      type: Number,
      min: [1, 'Duration must be at least 1 week'],
      max: [52, 'Duration cannot exceed 52 weeks'],
    },
    milestones: [milestoneSchema],
    isPublished: { type: Boolean, default: false },
    enrollmentCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

roadmapSchema.index({ mentorId: 1 });
roadmapSchema.index({ technologies: 1 });
roadmapSchema.index({ difficulty: 1 });
roadmapSchema.index({ isPublished: 1 });
roadmapSchema.index({ title: 'text', description: 'text' });

roadmapSchema.virtual('mentor', {
  ref: 'User',
  localField: 'mentorId',
  foreignField: '_id',
  justOne: true,
});

roadmapSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'roadmapId',
});

roadmapSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'roadmapId',
});

module.exports = mongoose.model('Roadmap', roadmapSchema);