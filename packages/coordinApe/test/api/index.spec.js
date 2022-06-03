'use strict'

const { expect } = require('chai')
const request = require('supertest')

const address = '0x3....'
const signature = ''
const data = ''

describe('Coordinape', async () => {
  it('pullData', async () => {
    const response = await request(global.server)
      .post('/api/pullCoordinapeData')
      .send({ address, signature, data })

    expect(response.body.corrdinapeProfileVCData).to.be.not.undefined
    expect(response.status).to.be.equal(200)
  })
})
