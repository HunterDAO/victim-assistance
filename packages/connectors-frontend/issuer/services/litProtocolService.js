'use strict'

// const getRandomValues = () => {}
// global.window = { crypto: { getRandomValues } }

const Blob = require('cross-blob')
global.Blob = Blob

if (!Blob) {
  globalThis.Blob = require('cross-blob')
}

const aes = require('browserify-aes/browser')
const aesModes = require('browserify-aes/modes')
const crypto = require('crypto')

const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

const LitJsSdk = require('lit-js-sdk/build/index.node.js')
const { CHAIN } = process.env
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
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '0',
    },
  },
]

class LitProtocolService {
  constructor(litNodeClient) {
    this._litNodeClient = litNodeClient
  }

  static async initlize() {
    const litNodeClient = new LitJsSdk.LitNodeClient({
      alertWhenUnauthorized: false,
    })
    await litNodeClient.connect()

    return new LitProtocolService(litNodeClient)
  }

  _generateSymmetricKey() {
    const symmetricKey = crypto.randomBytes(32)

    return symmetricKey
  }

  _encryptString(string, encryptionKeyBuffer) {
    const stringBuffer = Buffer.from(String(string))
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, encryptionKeyBuffer, iv)
    const encryptedString = Buffer.concat([
      cipher.update(stringBuffer),
      cipher.final(),
    ])

    return Buffer.concat([iv, encryptedString]).toString('base64')
  }

  _decryptString(encryptedString, encryptionKey) {
    const encryptedStringBuffer = Buffer.from(encryptedString, 'base64')

    const iv = encryptedStringBuffer.slice(0, IV_LENGTH)
    const encryptedStringWtihoutVector = encryptedStringBuffer.slice(IV_LENGTH)

    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv)

    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedStringWtihoutVector),
      decipher.final(),
    ])
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

    const encryptedMessage = this._recursion(
      message,
      symmetricKey,
      '_encryptString'
    )

    return {
      encrypted: encryptedMessage,
      symmetricKey: symmetricKey.toString('hex'),
    }
  }

  async decrypt(encrypted, symmetricKeyHex) {
    const encryptionKey = Buffer.from(symmetricKeyHex, 'hex')

    const decrypted = this._recursion(
      encrypted,
      encryptionKey,
      '_decryptString'
    )

    return decrypted
  }

  // NOTE: not using, left there just for refference
  async _litEncrypt(message) {
    const string = JSON.stringify(message)
    // let { encryptedZip, symmetricKey } = await LitJsSdk.zipAndEncryptString(string)
    let { encryptedString, symmetricKey } = await LitJsSdk.encryptString(string)

    const encrypted = encryptedString
    symmetricKey = LitJsSdk.uint8arrayToString(symmetricKey, 'base16')

    return { encrypted, symmetricKey }
  }

  // NOTE: not using, left there just for refference
  async _litDecrypt(encrypted, symmetricKeyHex) {
    const encryptedBlob = encrypted
    const symmetricKey = LitJsSdk.uint8arrayFromString(
      symmetricKeyHex,
      'base16'
    )

    const decryptedString = await LitJsSdk.decryptString(
      encryptedBlob,
      symmetricKey
    )
    const decrypted = JSON.parse(decryptedString)

    return decrypted
  }

  async saveKey(symmetricKeyHex, authSig, accessControlConditions) {
    accessControlConditions =
      accessControlConditions || defaultAccessControlConditions
    const symmetricKey = LitJsSdk.uint8arrayFromString(
      symmetricKeyHex,
      'base16'
    )

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

  async getKey(encryptedKeyHex, authSig, accessControlConditions) {
    accessControlConditions =
      accessControlConditions || defaultAccessControlConditions
    const symmetricKey = await this._litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: encryptedKeyHex,
      chain,
      authSig,
    })

    const symmetricKeyHex = LitJsSdk.uint8arrayToString(symmetricKey, 'base16')

    return symmetricKeyHex
  }
}

module.exports = LitProtocolService
