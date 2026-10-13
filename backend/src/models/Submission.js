const mongoose = require('mongoose');
const { SUBMISSION_STATUS } = require('../utils/constants');

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repoUrl: {
      type: String,
      required: [true, 'Repository URL is required'],
      match: [/^https?:\/\/(www\.)?github\.com\/.+\/.+$/, 'Please provide a valid GitHub URL'],
    },
    liveUrl: { type: String, default: null },
    notes: { type: String, maxlength: [1000, 'Notes cannot exceed 1000 characters'] },
    attachments: [
      {
        url: String,
        publicId: String,
        filename: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUS),
      default: SUBMISSION_STATUS.SUBMITTED,
    },
    feedback: { type: String, maxlength: [2000, 'Feedback cannot exceed 2000 characters'] },
    score: { type: Number, min: 0, max: 10, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

submissionSchema.index({ assignmentId: 1 });
submissionSchema.index({ menteeId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ createdAt: -1 });

submissionSchema.virtual('assignment', {
  ref: 'Assignment',
  localField: 'assignmentId',
  foreignField: '_id',
  justOne: true,
});

submissionSchema.virtual('mentee', {
  ref: 'User',
  localField: 'menteeId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Submission', submissionSchema);