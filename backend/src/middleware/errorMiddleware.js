export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  console.error('[ERROR]', req.method, req.originalUrl, statusCode, err.message);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
