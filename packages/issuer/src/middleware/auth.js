'use strict'

const jwt = require('jsonwebtoken')

let { TRUSTED_PUBLIC_KEY } = process.env
TRUSTED_PUBLIC_KEY = TRUSTED_PUBLIC_KEY.replace(/\\n/g, '\n')

const trustedTokenIssuers = [
  'coordinape-connector',
  'github-connector',
  'discord-connector',
  // 'sourceCred-connector',
  'poap-connector',
]
const serviceName = 'hunterdao-issuer'

module.exports = (app) => {
  const handler = async (req, res, next) => {
    try {
      const token = req.headers['auth']
      if (!token) {
        const error = new Error('Auth missed')
        error.httpStatusCode = 401
        next(error)
      }

      const decoded = jwt.verify(token, TRUSTED_PUBLIC_KEY)
      const { iss, aud } = decoded

      if (!trustedTokenIssuers.includes(iss) || aud !== serviceName) {
        const invalidTokenError = new Error('Auth not valid')
        invalidTokenError.httpStatusCode = 401
        next(invalidTokenError)
      }
    } catch (error) {
      error.httpStatusCode = 401
      next(error)
    }
    
    next()
  }

  return handler
}
