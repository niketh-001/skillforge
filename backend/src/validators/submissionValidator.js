const Joi = require('joi');

const createSubmissionSchema = Joi.object({
  assignmentId: Joi.string().required(),
  repoUrl: Joi.string()
    .uri()
    .pattern(/^https?:\/\/(www\.)?github\.com\/.+\/.+$/)
    .required()
    .messages({ 'string.pattern.base': 'Please provide a valid GitHub URL' }),
  liveUrl: Joi.string().uri().allow(null, ''),
  notes: Joi.string().max(1000).allow(''),
});

const reviewSubmissionSchema = Joi.object({
  status: Joi.string().valid('under_review', 'approved', 'needs_work', 'rejected').required(),
  feedback: Joi.string().max(2000).required(),
  score: Joi.number().min(0).max(10),
});

module.exports = { createSubmissionSchema, reviewSubmissionSchema };