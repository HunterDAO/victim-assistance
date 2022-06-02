'use strict'

const express = require('express')
const router  = express.Router()
const issueStructeredData = require('./issueStructeredData')

router.route('/issueStructeredData').post(issueStructeredData)

module.exports = router
