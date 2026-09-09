const errorHandler = (error, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl}`, error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.statusCode || 500).json({
    message: error.statusCode
      ? error.message
      : "Internal server error.",
  });
};

module.exports = errorHandler;
