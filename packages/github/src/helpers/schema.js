module.exports = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: 'username', // Github username
    },
    repos: {
      type: 'array', // Array of Repositories
      items: {
        type: 'string',
      },
    },
    languages: {
      type: 'array', // Array of Languages used (desceding popularity order)
      items: {
        type: 'string',
      },
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
  required: ['username', 'repos', 'languages'],
}
