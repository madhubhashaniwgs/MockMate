const errorHandler = (error, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl}`, error);

  if (res.headersSent) {
    return next(error);
  }

  const upstreamStatus = Number(error.status);
  const isUpstreamServerError =
    upstreamStatus >= 500 && upstreamStatus <= 599;

  const status =
    error.statusCode || (isUpstreamServerError ? upstreamStatus : 500);
  const hasKnownStatus =
    Boolean(error.statusCode) || isUpstreamServerError;

  res.status(status).json({
    message: hasKnownStatus ? error.message : "Internal server error.",
  });
};

module.exports = errorHandler;
