'use strict'
const fetch = require('node-fetch')
const { HOST } = process.env
const createAuth = require('../helpers/createAuth')
const Validator = require('jsonschema').Validator

const v = new Validator()

class IssuerService {
  constructor() { }

  async validateDataAgainstSchema(data, schema) {
    return v.validate(data, schema)
  }

  async issueStructeredData(data, type, encrypt = false) {
    return fetch(`${HOST}/api/issuer`, {
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
