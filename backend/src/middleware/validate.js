const AppError = require('../utils/AppError');

const validate = schema => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return next(new AppError(`Validation failed: ${errors.map(e => e.message).join(', ')}`, 400));
  }

  req.body = value;
  next();
};

module.exports = validate;