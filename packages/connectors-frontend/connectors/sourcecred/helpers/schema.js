module.exports = {
  type: 'object',
  properties: {
    date: {
      type: 'string',
      format: 'date-time',
      title: 'date', // Issuance date
      maxLength: 30,
    },
    instance: {
      type: 'string',
      title: 'instance', // Name of SourceCred instance, organization, DAO
    },
    credScore: {
      type: 'number',
      title: 'credScore', // Cred score of the user
    },
    issuerDid: {
      type: 'string',
      title: 'issuerDid',
    },
    holderDid: {
      type: 'string',
      title: 'holderDid',
    },
    signature: {
      type: 'string',
      title: 'signature',
    },
  },
  required: ['instance', 'credScore'],
}
