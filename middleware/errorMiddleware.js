// Runs when no route matched the requested URL
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// Central error handler. Any controller calling next(error) lands
// here, so error formatting lives in exactly one place.
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message,
    // Stack traces help in development but leak internals in production
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
