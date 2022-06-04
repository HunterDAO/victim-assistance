const jwt = require('jsonwebtoken')
let { TRUSTED_PUBLIC_KEY } = require('../../../../secrets').TRUSTED_PUBLIC_KEY;
TRUSTED_PUBLIC_KEY = TRUSTED_PUBLIC_KEY.replace(/\\n/g, '\n')

const trustedTokenIssuers = [
  'coordinape-connector',
  'github-connector',
  'discord-connector',
  'sourceCred-connector',
  'poap-connector',
]
const serviceName = 'deep-skills-issuer'

const withAuth = (cb) => async (req, res) => {
  try {
    const token = req.headers['auth']
    if (!token) {
      throw new Error('Auth missed')
    }

    const decoded = jwt.verify(token, TRUSTED_PUBLIC_KEY)
    const { iss, aud } = decoded

    if (!trustedTokenIssuers.includes(iss) || aud !== serviceName) {
      throw new Error('Auth not valid')
    }
  } catch (error) {
    console.log(error)
    return res.status(401).send({ error: error.message })
  }

  await cb(req, res)
}
module.exports = withAuth
