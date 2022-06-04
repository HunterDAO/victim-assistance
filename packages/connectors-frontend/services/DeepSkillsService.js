import { ethers } from 'ethers'
import { CeramicService } from './CeramicService'
import models from './models'
// import { DeepSkillsContractService } from './DeepSkillsContractService'

const knownDataTypes = [
  'apeprofiles',
  'githubs',
  'discords',
  'sourcecreds',
  'poaps',
]

export class DeepSkillsService {
  constructor(ceramic, ethereum) {
    // this._did = ceramic.did._id
    const provider = new ethers.providers.Web3Provider(ethereum)

    this._ceramicService = new CeramicService(ceramic)
    // this._deepSkillsContractService = new DeepSkillsContractService(ethereum)
    this._signer = provider.getSigner()
  }

  async pullIssuerDid() {
    // const issuerDids = []
    // const lastIssuerIndex = await this._deepSkillsContractService.pullLastIssuerIndex()

    // let index = 0
    // if (lastIssuerIndex > 0) {
    //   while (index < lastIssuerIndex) {
    //     const issuer = await this._deepSkillsContractService.pullIssuerByIndex(index)
    //     console.log('issuer!!!', issuer)
    //     index++
    //     issuerDids.push(issuer)
    //   }

    // }
    // return issuerDids
    return 'did:key:z6Mkrw8nQe8guQYgZT3rJ4es18wxTy2TrutkTFyjfbZ2NPce'
  }

  async _decryptDocument(structeredData) {
    let { isEncrypted, encryptedKeyHex, accessControlConditions, holderDid } =
      structeredData

    if (!isEncrypted) {
      return structeredData
    }

    accessControlConditions = JSON.parse(accessControlConditions)

    delete structeredData.isEncrypted
    delete structeredData.encryptedKeyHex
    delete structeredData.accessControlConditions
    delete structeredData.holderDid

    const authSig = await window.litProtocolService.signAuthMessage()

    const symmetricKeyHex = await window.litProtocolService.getKey(
      encryptedKeyHex,
      authSig,
      accessControlConditions
    )
    const decryptedDocument = await window.litProtocolService.decrypt(
      structeredData,
      symmetricKeyHex
    )

    decryptedDocument.holderDid = holderDid
    return decryptedDocument
  }

  async pullMySkills() {
    const holderDid = await this._signer.getAddress()
    const issuerDid = await this.pullIssuerDid()
    let issuedDocuments = []

    const promises = []

    for (const knownDataType of knownDataTypes) {
      promises.push(
        this._ceramicService.buildDataModelStore(models[knownDataType])
      )
    }
    const modelResults = await Promise.all(promises)

    const dataPromises = []
    for (const [index, modelResult] of modelResults.entries()) {
      const alias = knownDataTypes[index]
      const { publishedModel } = modelResult
      dataPromises.push(
        this._ceramicService.pullStoreDataByDID(
          publishedModel,
          issuerDid,
          alias
        )
      )
    }

    const results = await Promise.all(dataPromises)

    for (const result of results) {
      issuedDocuments = issuedDocuments.concat(result)
    }

    const filteredDocuments = issuedDocuments.filter((_doc) => {
      return _doc.holderDid === holderDid
    })

    console.log('My Documents!!', filteredDocuments)
    const revealedDocuments = []
    for (let filteredDocument of filteredDocuments) {
      const decryptedDocument = await this._decryptDocument(filteredDocument)
      revealedDocuments.push(decryptedDocument)
    }
    return revealedDocuments
  }
}
