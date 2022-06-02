'use strict'

const typeis     = require('type-is')
const getRawBody = require('raw-body')
const onFinished = require('on-finished')

const DEFAULT_JSON_SIZE_LIMIT = '2mb'

const isJson = req => {
  return typeis(req, ['application/json'])
}

const jsonBody = (limit = DEFAULT_JSON_SIZE_LIMIT) => {
  return (req, res, next) => {
    if (!isJson(req)) {
      return next()
    }

    req.body = {}

    if (!typeis.hasBody(req)) {
      return next()
    }

    getRawBody(req, { limit,  encoding: 'utf-8' }, (rawBodyError, buffer) => {
      if (rawBodyError) {
        const error = new Error(rawBodyError)

        req.resume()
        return onFinished(req, () => next(error))
      }

      const text = buffer.toString()

      if (!text) {
        return next()
      }

      try {
        req.body = JSON.parse(text)

      } catch (parsingError) {
        const error = new Error(parsingError)
        return next(error)

      }

      return next()
    })
  }
}

module.exports = jsonBody
