'use strict'

const jwt = require('jsonwebtoken')
const DEFAULT_EXP_IN_SECONDS = 60
let { SERVICE_PRIVATE_KEY } = process.env

const createAuth = () => {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + DEFAULT_EXP_IN_SECONDS

  const payload = {
    iss: 'discord-connector',
    aud: 'deep-skills-issuer',
    exp: expiresAt,
  }

  SERVICE_PRIVATE_KEY = SERVICE_PRIVATE_KEY.replace(/\\n/g, '\n')
  const token = jwt.sign(payload, SERVICE_PRIVATE_KEY, { algorithm: 'RS256' })

  return token
}

module.exports = createAuth
