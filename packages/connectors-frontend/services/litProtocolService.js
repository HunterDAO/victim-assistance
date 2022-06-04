'use strict'

import aes from 'browserify-aes/browser'
import aesModes from 'browserify-aes/modes'

import randomBytes from 'randombytes'
import LitJsSdk from 'lit-js-sdk'

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

// const { CHAIN } = process.env
const CHAIN = 'rinkeby'
const chain = CHAIN

const createCipher = (suite, key, iv, isDecipher = false) => {
  let cipherType = 'createCipheriv'
  if (isDecipher) {
    cipherType = 'createDecipheriv'
  }

  suite = suite.toLowerCase()

  if (aesModes[suite]) {
    return aes[cipherType](suite, key, iv)
  }

  throw new Error('invalid suite type')
}

const createCipheriv = (suite, key, iv) => {
  return createCipher(suite, key, iv)
}

const createDecipheriv = (suite, key, iv) => {
  return createCipher(suite, key, iv, true)
}

const defaultAccessControlConditions = [
  {
    contractAddress: '',
    standardContractType: '',
    chain,
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

export class LitProtocolService {
  constructor(litNodeClient) {
    this._litNodeClient = litNodeClient
  }

  static async initlize() {
    const litNodeClient = new LitJsSdk.LitNodeClient()
    await litNodeClient.connect()

    return new LitProtocolService(litNodeClient)
  }

  _generateSymmetricKey() {
    const symmetricKey = randomBytes(32)

    return symmetricKey
  }

  _encryptString(string, encryptionKeyBuffer) {
    const stringBuffer = Buffer.from(String(string))
    const iv = randomBytes(IV_LENGTH)

    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, encryptionKeyBuffer, iv)
    const encryptedString = Buffer.concat([cipher.update(stringBuffer), cipher.final()])

    return Buffer.concat([iv, encryptedString]).toString('base64')
  }

  _decryptString(encryptedString, encryptionKey) {
    const encryptedStringBuffer = Buffer.from(encryptedString, 'base64')

    const iv = encryptedStringBuffer.slice(0, IV_LENGTH)
    const encryptedStringWtihoutVector = encryptedStringBuffer.slice(IV_LENGTH)

    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv)

    const decryptedBuffer = Buffer.concat([decipher.update(encryptedStringWtihoutVector), decipher.final()])
    const decryptedString = decryptedBuffer.toString()

    return decryptedString
  }

  _recursion(field, symmetricKey, method) {
    let result
    const isArray = Array.isArray(field)
    const isObject = typeof field === 'object'
    if (isArray) {
      result = []
      for (const arrayElement of field) {
        result.push(this._recursion(arrayElement, symmetricKey, method))
      }

    } else if (isObject) {
      result = {}
      for (const key in field) {
        result[key] = this._recursion(field[key], symmetricKey, method)
      }
    } else {
      result = this[method](field, symmetricKey)
    }

    return result
  }

  async encrypt(message) {
    const symmetricKey = this._generateSymmetricKey()

    const encryptedMessage = this._recursion(message, symmetricKey, '_encryptString')

    return { encrypted: encryptedMessage, symmetricKey: symmetricKey.toString('hex') }
  }

  async decrypt(encrypted, symmetricKeyHex) {
    const encryptionKey = Buffer.from(symmetricKeyHex, 'hex')

    const decrypted = this._recursion(encrypted, encryptionKey, '_decryptString')

    return decrypted
  }

  async saveKey(symmetricKeyHex, authSig, accessControlConditions) {
    accessControlConditions = accessControlConditions || defaultAccessControlConditions
    const symmetricKey = LitJsSdk.uint8arrayFromString(symmetricKeyHex, 'base16')

    const encryptedKey = await this._litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
      // permanant: 0
    })

    const encryptedKeyHex = LitJsSdk.uint8arrayToString(encryptedKey, 'base16')

    return encryptedKeyHex
  }

  async signAuthMessage() {
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })

    return authSig
  }

  async getKey(encryptedKeyHex, authSig, accessControlConditions) {
    accessControlConditions = accessControlConditions || defaultAccessControlConditions
    const symmetricKey = await this._litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: encryptedKeyHex,
      chain,
      authSig
    })

    const symmetricKeyHex = LitJsSdk.uint8arrayToString(symmetricKey, 'base16')

    return symmetricKeyHex
  }

}
