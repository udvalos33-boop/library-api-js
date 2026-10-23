export function notFound(req, res) {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  const status = error.status === 400 ? 400 : 500;

  res.status(status).json({
    message:
      status === 400
        ? "Invalid request"
        : "Internal server error"
  });
}