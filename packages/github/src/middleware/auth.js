'use strict'

module.exports = app => {
  const handler = async(req, res, next) => {
    try {
      true

    } catch (error) {
      error.httpStatusCode = 401
      next(error)
    }

    next()
  }

  return handler
}
