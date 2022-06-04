'use strict'

const { inflate } = require('pako')

const uncompress = (data) => {
  const result = inflate(data, { to: 'string' })
  const jsonDocument = JSON.parse(result)

  return jsonDocument

}

module.exports = uncompress
