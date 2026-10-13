const Joi = require('joi');

const createRoadmapSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(2000).required(),
  technologies: Joi.array().items(Joi.string()).default([]),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
  duration: Joi.number().min(1).max(52),
  milestones: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow(''),
        order: Joi.number().required(),
      })
    )
    .default([]),
  isPublished: Joi.boolean().default(false),
});

const updateRoadmapSchema = Joi.object({
  title: Joi.string().min(5).max(100),
  description: Joi.string().min(20).max(2000),
  technologies: Joi.array().items(Joi.string()),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  duration: Joi.number().min(1).max(52),
  milestones: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().allow(''),
      order: Joi.number().required(),
    })
  ),
  isPublished: Joi.boolean(),
});

module.exports = { createRoadmapSchema, updateRoadmapSchema };