'use strict'

const { expect } = require('chai')
const LitProtocolService = require('../../src/services/litProtocolService')
const IssuerService = require('../../src/services/issuerService')

describe('LitProtocolService', async() => {
  let litProtocolService
  let authSig

  before(async() => {
    litProtocolService = await LitProtocolService.initlize()
    authSig = await IssuerService.createLITAuthSig()
  })

  it('.encrypt and then .decrypt', async() => {
    const message = {
      stringElem: 'secret test',
      objectElem: { objecktKey1: 'objectValue1', objecktKey2: 'objectValue2' },
      arrayElem: ['1', '2', '3'],
      arrayOfObects: [{ objectField1: ['1', '2'], objectField2: 'asd', objectField3: { property: 'asd' } }]
    }
    const { encrypted, symmetricKey } = await litProtocolService.encrypt(message)
    expect(encrypted).to.be.not.undefined
    expect(symmetricKey).to.be.not.undefined

    const decrypted = await litProtocolService.decrypt(encrypted, symmetricKey)
    expect(decrypted).to.be.not.undefined
    expect(decrypted).to.be.deep.equal(message)
  })

  it('.saveKey and then .getKey', async() => {
    const message = { value: 'secret test' }
    const { encrypted, symmetricKey } = await litProtocolService.encrypt(message)

    const encryptedKeyHex = await litProtocolService.saveKey(symmetricKey, authSig)
    expect(encryptedKeyHex).to.be.not.undefined

    const pulledSymmetricKey = await litProtocolService.getKey(encryptedKeyHex, authSig)
    expect(pulledSymmetricKey).to.be.not.undefined
    expect(pulledSymmetricKey).to.be.equal(symmetricKey)
  })
})
