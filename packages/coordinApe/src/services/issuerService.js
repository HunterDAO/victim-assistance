'use strict'
const fetch = require('node-fetch')
const { ISSUER_SERVICE_API_URL } = process.env
const createAuth = require('../helpers/createAuth')
const Validator = require('jsonschema').Validator

const v = new Validator()

class IssuerService {
  constructor() {}

  async validateDataAgainstSchema(data, schema) {
    return v.validate(data, schema)
  }

  async issueStructeredData(data, type, encrypt) {
    return fetch(`${ISSUER_SERVICE_API_URL}/issueStructeredData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Auth: createAuth(),
      },
      body: JSON.stringify({
        data,
        type,
        encrypt,
      }),
    })
      .then((res) => res.json())
      .catch((e) => {
        console.log(e)
        return null
      })
  }
}

module.exports = IssuerService
