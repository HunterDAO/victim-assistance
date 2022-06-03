'use strict'
const ethers = require('ethers')
const abi = require('../abi/poap')
const { ANKR_JSONRPC_API_ENDPOINT } = process.env
const fetch = require('node-fetch')
const POAP_CONTRACT_ADDRESS = '0x22c1f6050e56d2876009903609a2cc3fef83b415'

class PoapService {
  constructor() {
    this._provider = new ethers.providers.JsonRpcProvider(
      ANKR_JSONRPC_API_ENDPOINT
    )
    this._contract = new ethers.Contract(
      POAP_CONTRACT_ADDRESS,
      abi,
      this._provider
    )
  }

  getVerifiedAddress(digest, signature) {
    return ethers.utils.verifyMessage(digest, signature)
  }

  async prepareTokensForIssue(token) {
    const possibleEndDate = token?.attributes.find(
      (attr) => attr.trait_type === 'endDate'
    )?.value
    const possibleStartDate = token?.attributes.find(
      (attr) => attr.trait_type === 'startDate'
    )?.value
    const date = possibleEndDate || possibleStartDate
    return {
      title: token?.name,
      description: token?.description,
      image: token?.image_url,
      date,
    }
  }
  
  async fetchTokenInformation(tokenURL) {
    return await fetch(tokenURL).then((res) => res.json())
  }

  async getTokensInfoOwnedBy(address) {
    const balance = await this._contract.balanceOf(address)
    const tokens = []
    /*
      TODO: parseInt return 2^53-1 value, if user has more than 2^53-1 tokens 
            iterator will be broken
    */
    for (let i = 0; i < parseInt(balance.toString(), 10); i++) {
      tokens.push(
        this._contract
          .tokenOfOwnerByIndex(address, i)
          .then((tokenId) => this._contract.tokenURI(tokenId.toString()))
          .then(this.fetchTokenInformation)
          .then(this.prepareTokensForIssue)
          .catch(() => [])
      )
    }
    return Promise.all(tokens)
  }
}

module.exports = PoapService
