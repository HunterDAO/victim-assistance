'use strict'

const { DID } = require('dids')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const { getResolver } = require('key-did-resolver')
const { CeramicClient } = require('@ceramicnetwork/http-client')

const { DataModel } = require('@glazed/datamodel')
const { DIDDataStore } = require('@glazed/did-datastore')
const { Core } = require('@self.id/core')
const { ModelManager } = require('@glazed/devtools')
const { fromString } = require('uint8arrays')

const { knownDataTypes } = require('../helpers/index')
const IssuerService = require('./issuerService')

const models = require('../models/index')

const { SEED, CERAMIC_URL, CHAIN } = process.env
if (!SEED) {
  throw new Error('Missing SEED environment variable')
}

const accessControlConditions = [
  {
    contractAddress: '',
    standardContractType: '',
    chain: CHAIN,
    method: 'eth_getBalance',
    parameters: [
      ':userAddress',
      'latest'
    ],
    returnValueTest: {
      comparator: '>=',
      value: '0'
    }
  }
]

class CeramicService {
  constructor() {
    const seed = fromString(SEED, 'base16')
    const did = new DID({
      provider: new Ed25519Provider(seed),
      resolver: getResolver(),
    })

    this._ceramic = new CeramicClient(CERAMIC_URL)
    this._did = did
  }

  get ceramic() {
    return this._ceramic
  }

  get did() {
    return this._did
  }

  async initilize() {
    await this._did.authenticate()
    this._ceramic.did = this._did
  }

  async buildDataModelStore(modelDefition) {
    const manager = new ModelManager(this._ceramic)
    manager.addJSONModel(modelDefition)

    const publishedModel = await manager.toPublished()

    const model = new DataModel({
      ceramic: this._ceramic,
      model: publishedModel,
    })
    const dataStore = new DIDDataStore({ ceramic: this._ceramic, model })

    return { model, publishedModel, dataStore }
  }

  async getStoreData(dataStore, alias) {
    const result = await dataStore.get(alias)

    return result
  }

  async setStoreData(dataStore, data, alias) {
    await dataStore.set(alias, data)
  }

  async pullStoreDataForDID(publishedModel, did, alias) {
    const core = new Core({ ceramic: API_URL, model: publishedModel })
    const documents = await core.get(alias, did)

    return documents
  }

  async encryptDocument(structeredData) {
    const { holderDid } = structeredData
    const { encrypted, symmetricKey } = await global.litProtocolService.encrypt(structeredData)
    const authSig = await IssuerService.createLITAuthSig()
    const encryptedKeyHex = await litProtocolService.saveKey(symmetricKey, authSig, accessControlConditions)

    encrypted.isEncrypted = true
    encrypted.encryptedKeyHex = encryptedKeyHex
    encrypted.accessControlConditions = JSON.stringify(accessControlConditions)
    encrypted.holderDid = holderDid

    return encrypted
  }

  async decryptDocument(structeredData) {
    let { isEncrypted, encryptedKeyHex, accessControlConditions } = structeredData
    accessControlConditions = JSON.parse(accessControlConditions)

    if (!isEncrypted) {
      return structeredData
    }

    delete structeredData.isEncrypted
    delete structeredData.encryptedKeyHex
    delete structeredData.accessControlConditions

    const authSig = await IssuerService.createLITAuthSig()
    const symmetricKeyHex = await global.litProtocolService.getKey(encryptedKeyHex, authSig, accessControlConditions)
    const decryptedDocument = await global.litProtocolService.decrypt(structeredData, symmetricKeyHex)

    return decryptedDocument
  }

  async storeData(structeredData, type, encrypt = false) {
    if (!knownDataTypes.includes(type)) {
      throw Error(
        `${type} ceramic model not supported, supported are ${knownDataTypes}`
      )
    }

    if (encrypt) {
      structeredData = await this.encryptDocument(structeredData)
    }

    const { publishedModel, dataStore } = await this.buildDataModelStore(
      models[type]
    )
    const allDocuments = (await this.getStoreData(dataStore, type)) || {}

    const documents = allDocuments[type] || []
    documents.push(structeredData)

    const dataToStore = {}
    dataToStore[type] = documents
    console.dir(dataToStore, { depth: 10 })
    await this.setStoreData(dataStore, dataToStore, type)

    return structeredData
  }
}

module.exports = CeramicService
