class ResponseHandler {
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  static error(res, message = "Internal server error", statusCode = 500, details = null) {
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }

    if (details && process.env.NODE_ENV === "development") {
      response.details = details
    }

    return res.status(statusCode).json(response)
  }

  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
      timestamp: new Date().toISOString(),
    })
  }

  static notFound(res, resource = "Resource") {
    return res.status(404).json({
      success: false,
      error: `${resource} not found`,
      timestamp: new Date().toISOString(),
    })
  }

  static unauthorized(res, message = "Unauthorized access") {
    return res.status(401).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    })
  }

  static forbidden(res, message = "Access forbidden") {
    return res.status(403).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    })
  }

  static conflict(res, message = "Resource already exists") {
    return res.status(409).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    })
  }
}

module.exports = ResponseHandler;
