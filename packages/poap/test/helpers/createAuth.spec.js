'use strict'

const { expect } = require('chai')
const createAuth = require('../../src/helpers/createAuth')

describe('.createAuth', async() => {
  it('createAuth', async() => {
    const token = await createAuth()

    expect(token).to.be.not.undefined
  })
})
