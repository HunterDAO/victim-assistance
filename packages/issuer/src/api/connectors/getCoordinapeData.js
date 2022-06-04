'use strict'
const CoordinApeService = require('../services/coordinapeService');
const IssuerService = require('../../services/issuerService');
const fetchStructuredData = require('../structeredData').fetchStructuredData;

const schema = require('../helpers').coordinapeSchema;
const ISSUE_CREDENTIALS_TYPE = 'apeprofiles';
const issuerService = new IssuerService();
const withTimeout = require('../helpers/withTimeout');

const getCoordinapeData = withTimeout(async (req, res) => {
  try {
    const { signature, address, data, hash, encrypt } = req.body;
    const coordinApeService = new CoordinApeService({
      signature,
      address,
      data,
      hash,
    });

    const token = await coordinApeService.getToken();
    coordinApeService.setToken(token);

    const pulledData = await coordinApeService.pullData();

    let validationResults = await issuerService.validateDataAgainstSchema(
      pulledData,
      schema
    );

    if (validationResults.errors.length > 0) {
      throw new Error('schema got changed');
    }

    pulledData.holderDid = address
    let results = await fetchStructuredData(
      pulledData,
      ISSUE_CREDENTIALS_TYPE,
      encrypt
    );

    const cordinapeProfileVCData = {
      skills: results?.profile?.skills,
      rest: results,
    };

    res.status(200).json({ cordinapeProfileVCData, results });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
})

module.exports = getCoordinapeData;
