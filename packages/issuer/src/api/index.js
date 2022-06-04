'use strict'

const express = require('express');
const router  = express.Router();
const getPoapTokens = require('./getPoapTokens');
const getGithubData = require('./github/callback');
const getCoordinapeData = require('./getCoordinapeData');
const issueStructeredData = require('./structeredData').issueStructeredData;

router.route('/poaps').post(getPoapTokens);
router.route('/github').post(getGithubData);
router.route('/coordinape').post(getCoordinapeData);

router.route('/issueStructeredData').post(issueStructeredData);

module.exports = router;
