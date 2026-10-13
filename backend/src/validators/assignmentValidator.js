const Joi = require('joi');

const createAssignmentSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().max(2000).required(),
  roadmapId: Joi.string().required(),
  requirements: Joi.array().items(Joi.string()).default([]),
  dueDate: Joi.date().iso().required(),
  resources: Joi.array()
    .items(Joi.object({ title: Joi.string(), url: Joi.string().uri() }))
    .default([]),
  isPublished: Joi.boolean().default(false),
});

const updateAssignmentSchema = Joi.object({
  title: Joi.string().max(100),
  description: Joi.string().max(2000),
  requirements: Joi.array().items(Joi.string()),
  dueDate: Joi.date().iso(),
  resources: Joi.array().items(Joi.object({ title: Joi.string(), url: Joi.string().uri() })),
  isPublished: Joi.boolean(),
});

module.exports = { createAssignmentSchema, updateAssignmentSchema };