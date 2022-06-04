'use strict'

const IssuerService = require('../services/issuerService');
const CeramicService = require('../services/ceramicService');

const fetchStructuredData = async ( unstructuredData ) => {
  try {
    let { type, data, encrypt } = unstructuredData;
    encrypt = encrypt || false;

    const ceramicService = new CeramicService();
    await ceramicService.initilize();

    const issuerService = new IssuerService(ceramicService.did);
    const signedData = await issuerService.issue({ type, data });

    const structeredData = await ceramicService.storeData(signedData, type, encrypt);

    return { structeredData };
  } catch (err) {
    console.error(err);
  }
}

const issueStructeredData = async (req, res) => {
  try {
    const structeredData = fetchStructuredData(req);
    res.status(200).json({ structeredData });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = [
  prepareStructuredData,
  issueStructeredData
];