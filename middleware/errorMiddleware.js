// middleware/errorMiddleware.js

export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message;

  // Central error handler. Any controller calling next(error) lands
  // here, so error formatting lives in exactly one place.
  if (err.code === 11000) {
    statusCode = 409;
    message = 'This product batch already exists';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
