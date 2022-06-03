'use strict'

const { expect } = require('chai')
const request    = require('supertest')

const did = '0x3c4fAFDedCc29C5f2653DbAE3391917b33Cc6378'

describe('Github', async() => {
  it('githubRedirect', async() => {
    const host = 'https://test.com'

    const response = await request(global.server)
      .get('/api/githubRedirect')
      .query({ host, did })

    expect(response.status).to.be.equal(302)
  })

  it('githubCallback', async() => {
    const code = 'SomeGithubCode'

    const response = await request(global.server)
      .get('/api/githubCallback')
      .query({ code, did })

    expect(response.body.userVCData).to.be.not.undefined
    expect(response.body.reposVCData).to.be.not.undefined
    expect(response.status).to.be.equal(200)
  })
})
