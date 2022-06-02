'use strict'

const crypto = require('crypto')

const seed = crypto.randomBytes(32).toString('hex')

console.log('SEED:', seed)