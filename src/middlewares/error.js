export function notFound(req, res) {
    res.status(404).json({
      message: "Route not found",
      path: req.originalUrl
    });
  }
  
  export function errorHandler(error, req, res, next) {
    console.error(error);
  
    // JSON буруу бичигдсэн хүсэлт
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({
        message: "Invalid JSON"
      });
    }
  
    res.status(500).json({
      message: "Internal server error"
    });
  }