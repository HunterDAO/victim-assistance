'use strict'

const { expect } = require('chai')
const request    = require('supertest')
const createAuth = require('../helpers/createAuth')
const CeramicService = require('../../src/services/ceramicService')

const holderDid = 'did:3:kjzl6cwe1jw149u7xahdzwu6nsuwnf8iygdv0b7sbfwr3hyospdcx5ila6pvwc0'

describe('Issuer', async() => {
  const auth = createAuth()

  // it('issueStructeredData (colonies)', async() => {
  //   const type = 'colonies'
  //   const data = {
  //     holderDid,
  //     reputations: [
  //       {
  //         colonyname: 'DeepSkills',
  //         colonyaddress: 'xDaiContract',
  //         reputation: '99%'
  //       }
  //     ]
  //   }

  //   const response = await request(global.server)
  //     .post('/api/issueStructeredData')
  //     .set('auth', auth)
  //     .send({ type, data, encrypt: true })

  //   expect(response.body.structeredData).to.be.not.undefined
  //   expect(response.status).to.be.equal(200)

  //   expect(response.body.structeredData.holderDid).to.be.not.equal(data.holderDid)
  //   expect(response.body.structeredData.reputations).to.be.not.deep.equal(data.reputations)

  //   const ceramicService = new CeramicService()
  //   await ceramicService.initilize()
  //   const decryptedData = await ceramicService.decryptDocument(response.body.structeredData)
  // })

  it('issueStructeredData (apeprofiles)', async() => {
    const type = 'apeprofiles'
    const data = {
      holderDid,
      circle: 'DeepSkill Circle',
      skills: ['Web3', 'Fronend', 'Fullstack'],
      givesReceived: 4,
      notes: ['Made a good progress with implementation coordindape'],
      collaborators: [{
        username: 'Denis',
        avatar: 'https://test.avatar.jpg',
        address: 'x0...'
      }]
    }

    const response = await request(global.server)
      .post('/api/issueStructeredData')
      .set('auth', auth)
      .send({ type, data, encrypt: false })

    expect(response.body.structeredData).to.be.not.undefined
    expect(response.status).to.be.equal(200)
  })

  it('issueStructeredData (poaps)', async() => {
    const type = 'poaps'
    const data = {
      holderDid,
      date: new Date().toISOString(),
      title: 'Super NFT',
      description: 'BEst token ever',
      image: 'https://best-token-ever.com'
    }
    const response = await request(global.server)
      .post('/api/issueStructeredData')
      .set('auth', auth)
      .send({ type, data, encrypt: false })

    expect(response.body.structeredData).to.be.not.undefined
    expect(response.status).to.be.equal(200)
  })

  // it('issueStructeredData (sourcecreds)', async() => {
  //   const type = 'sourcecreds'
  //   const data = {
  //     holderDid,
  //     date: new Date().toISOString(),
  //     instance: 'https://source-cred-deep-skills.com',
  //     credScore: 100500,
  //   }

  //   const response = await request(global.server)
  //     .post('/api/issueStructeredData')
  //     .set('auth', auth)
  //     .send({ type, data, encrypt: true })

  //   console.log('response.body!!', response.body)
  //   expect(response.body.structeredData).to.be.not.undefined
  //   expect(response.status).to.be.equal(200)
  // })

  // it('issueStructeredData (discords)', async() => {
  //   const type = 'discords'
  //   const data = {
  //     holderDid,
  //     servers: [{
  //       servername: 'DeepSkills',
  //       serverid: 'someId',
  //       servericon: 'https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png'
  //     }]
  //   }

  //   const response = await request(global.server)
  //     .post('/api/issueStructeredData')
  //     .set('auth', auth)
  //     .send({ type, data, encrypt: false })

  //   expect(response.body.structeredData).to.be.not.undefined
  //   expect(response.status).to.be.equal(200)
  // })

  it('issueStructeredData (githubs)', async() => {
    const type = 'githubs'
    const data = {
      holderDid,
      username: 'DenisPopov15',
      repos: ['denver-eth-2022'],
      languages: ['TS', 'JS', 'Ruby', 'Python', 'PHP']
    }

    const response = await request(global.server)
      .post('/api/issueStructeredData')
      .set('auth', auth)
      .send({ type, data, encrypt: false })

    expect(response.body.structeredData).to.be.not.undefined
    expect(response.status).to.be.equal(200)
  })
})
