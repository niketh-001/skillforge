const mongoose = require('mongoose');
const { ENROLLMENT_STATUS } = require('../utils/constants');

const enrollmentSchema = new mongoose.Schema(
  {
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ENROLLMENT_STATUS),
      default: ENROLLMENT_STATUS.PENDING,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

enrollmentSchema.index({ menteeId: 1, roadmapId: 1 }, { unique: true });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ createdAt: -1 });

enrollmentSchema.virtual('mentee', {
  ref: 'User',
  localField: 'menteeId',
  foreignField: '_id',
  justOne: true,
});

enrollmentSchema.virtual('roadmap', {
  ref: 'Roadmap',
  localField: 'roadmapId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);