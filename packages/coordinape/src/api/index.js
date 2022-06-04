'use strict'

const express = require('express')
const pullData = require('./pullCoordinapeData')
const router = express.Router()

router.route('/pullCoordinapeData').post(pullData)

module.exports = router
