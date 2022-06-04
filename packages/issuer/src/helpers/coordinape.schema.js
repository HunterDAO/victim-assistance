module.exports = {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        maxLength: 30,
      },
      circle: {
        type: 'string',
      },
      skills: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      givesReceived: {
        type: 'number',
        title: 'givesRecieved',
      },
      notes: {
        type: 'array',
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
      collaborators: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            avatar: { type: 'string' },
            address: { type: 'string' },
          },
        },
      },
    },
    required: [
      'givesReceived',
      'notes',
      'skills',
      'circle',
      'date',
      'collaborators',
    ],
};
  