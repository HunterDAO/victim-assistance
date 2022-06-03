'use strict'

const express = require('express')
const getPoapTokens = require('./getPoapTokens')
const router = express.Router()

router.route('/getPoapTokens').post(getPoapTokens)

module.exports = router
