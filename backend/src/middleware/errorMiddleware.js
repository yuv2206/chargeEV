export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;

  // Handle PostgreSQL double-booking trigger exception as 409 Conflict
  if (err.message && err.message.includes('Double booking detected')) {
    statusCode = 409;
  }

  console.error('[ERROR]', req.method, req.originalUrl, statusCode, err.message);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
