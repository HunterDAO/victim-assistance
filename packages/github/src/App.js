'use strict'

require('dotenv').config()

const get        = require('lodash.get')
const express    = require('express')
const middleware = require('./middleware')
const routes     = require('./api/index')

const DEFAULT_EXIT_TIMEOUT = 1000 // milliseconds
const { PORT } = process.env

class App {
  constructor(config = {}) {
    const defaultConfig = {
      server: {
        port: PORT
      }
    }

    config = Object.assign(defaultConfig, config)
    this.config   = config
    this._isReady = false
  }

  get isReady() {
    return this._isReady
  }

  get logger() {
    return this._logger
  }

  get port() {
    return get(this.config, 'server.port')
  }

  get bodySizeLimit() {
    return get(this.config, 'server.bodySizeLimit', '2mb')
  }

  get exitTimeout() {
    return get(this.config, 'exitTimeout', DEFAULT_EXIT_TIMEOUT)
  }

  async createLogger() {
    console.info('> createLogger')

    this._logger = console
  }

  async createServer() {
    this._logger.info('> createServer')

    this.http = this.server = express()
    this.http.set('app', this)
  }

  createApi() {
    this._logger.info('> createApi')
    this.http.use('/api', routes)
  }

  createServerMiddleware() {
    this._logger.info('> createServerMiddleware')

    this.http.use(middleware.cors())
    this.http.use(middleware.helmet())
    // this.http.use(middleware.auth(this))
    this.http.use(middleware.jsonBody(this.bodySizeLimit))
  }

  async initialize() {
    await this.createLogger()

    this.createServer()
    this.createServerMiddleware()
    this.createApi()
  }

  async start() {
    try {
      await this.initialize()

    } catch (error) {
      this._logger.error(error)
      this._logger.fatal(`[app] Initialization error, shutdown in ${this.exitTimeout}ms`)

      return setTimeout(() => process.exit(1), this.exitTimeout)
    }

    this.http.use(middleware.error(this._logger))

    return new Promise(resolve => this.http.listen(this.port, () => {
      this._isReady = true

      this._logger.info(`[http] Server is listening on port ${this.port}`)
      resolve(this)
    }))
  }
}

module.exports = App
