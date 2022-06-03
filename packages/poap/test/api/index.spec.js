'use strict'

const { expect } = require('chai')
const request = require('supertest')

const address = '0x3....'
const signature = ''
const data = ''
const CORRECT_SIGNATURE =
  '0x9bd793297e733c1955c03e0fc0172c0296b68e1a826b41a411a080b1a9879ff76a4dad1ac7b647a00a9a13a7ad1ec91edc68f001e40266a893322479ee57e8811b'
const DIGEST = 'Login to Coordinape 1644747628'
const ADDRESS = '0x3A308eF23e49E87bEc2Ce2eBff676Da38FF40d67'
const RESP = [
  {
    name: 'Bankless Academy - lesson #1 Wallet Basics',
    description: 'Learn how to create and manage a wallet securely.',
    image_url:
      'https://assets.poap.xyz/bankless-academy-wallet-basics-2022-logo-1644421283550.png',
  },
]
describe('Poapservice', async () => {
  it('should throw error when wrong params', async () => {
    const response = await request(global.server)
      .post('/api/getPoapTokens')
      .send({ address: ADDRESS })
      .set('Content-Type', 'application/json')

    expect(response.statusCode).to.be.equal(400)
  })
  it('should return correct response when params correct', async () => {
    const response = await request(global.server)
      .post('/api/getPoapTokens')
      .send({ address: ADDRESS, signature: CORRECT_SIGNATURE, digest: DIGEST })
      .set('Content-Type', 'application/json')

    expect(response.statusCode).to.be.equal(200)
    expect(response.body).to.be.eql(RESP)
  })
})
