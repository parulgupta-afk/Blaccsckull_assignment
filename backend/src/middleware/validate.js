const { ApiError } = require('../utils/ApiError');

// Validates req[part] against a Zod schema; replaces it with the parsed
// (and therefore type-coerced/trimmed) value on success.
const validate = (schema, part = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[part]);
  if (!result.success) {
    return next(
      ApiError.badRequest('VALIDATION_ERROR', 'Invalid request.', result.error.flatten())
    );
  }
  req[part] = result.data;
  next();
};

module.exports = { validate };
