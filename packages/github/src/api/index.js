'use strict'

const express  = require('express')
const redirect = require('./redirect')
const callback = require('./callback')
const router   = express.Router()

router.route('/githubRedirect').get(redirect)
router.route('/githubCallback').get(callback)

module.exports = router
