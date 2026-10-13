const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  bio: Joi.string().max(500).allow(''),
  githubUsername: Joi.string().max(50).allow(null, ''),
  linkedinUrl: Joi.string().uri().allow(null, ''),
  portfolioUrl: Joi.string().uri().allow(null, ''),
});

module.exports = { updateProfileSchema };