'use strict'

module.exports = appLogger => {
  return (error, req, res, next) => {
    const { message, logger: operationLogger, httpStatusCode: statusCode = 500 } = error

    const { logger: requestLogger } = req
    const logger = operationLogger || requestLogger || appLogger

    if (statusCode === 500) {
      logger.error({ err: error }, `Server Error: ${message}`)

    } else {
      logger.warn({ err: error }, `Client Error ${statusCode}: ${message}`)

    }

    return res.status(statusCode).json(error)
  }
}
