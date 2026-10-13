const Joi = require('joi');

const sendMessageSchema = Joi.object({
  receiverId: Joi.string().required(),
  content: Joi.string().max(2000).required(),
});

module.exports = { sendMessageSchema };