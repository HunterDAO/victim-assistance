const IssuerService = require('../services/issuerService')
const CeramicService = require('../services/ceramicService')
const withAuth = require('../helpers/withAuth')

const issueStructeredData = withAuth(async (req, res) => {
  try {
    let { type, data, encrypt } = req.body
    encrypt = encrypt || false

    const ceramicService = new CeramicService()
    await ceramicService.initilize()

    const issuerService = new IssuerService(ceramicService.did)
    const signedData = await issuerService.issue({ type, data })

    const structeredData = await ceramicService.storeData(
      signedData,
      type,
      encrypt
    )

    res.status(200).json({ structeredData })
  } catch (e) {
    console.log(e)
    res.status(400).json({ error: e.message })
  }
})

module.exports = issueStructeredData
