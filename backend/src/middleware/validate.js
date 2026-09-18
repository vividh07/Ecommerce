import { ApiError } from '../utils/ApiError.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new ApiError(400, 'Validation failed', result.error.flatten().fieldErrors)
      );
    }
    req.validated = result.data;
    next();
  };
}
