module.exports = {
  type: 'object',
  properties: {
    date: {
      type: 'string',
      maxLength: 30,
    },
    title: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    image: {
      type: 'string',
    },
  },
  required: ['image', 'description', 'title', 'date'],
}
