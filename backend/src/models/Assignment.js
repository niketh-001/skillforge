const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
    },
    requirements: [{ type: String, trim: true }],
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    resources: [{ title: String, url: String }],
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

assignmentSchema.index({ roadmapId: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ createdAt: -1 });

assignmentSchema.virtual('roadmap', {
  ref: 'Roadmap',
  localField: 'roadmapId',
  foreignField: '_id',
  justOne: true,
});

assignmentSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignmentId',
});

module.exports = mongoose.model('Assignment', assignmentSchema);