'use strict'

const fetch = require('node-fetch')
const redirectUri = require('../helpers/discordRedirectUrl')
const ethers = require('ethers')

const { DISCORD_APP_CLIENT_ID, DISCORD_APP_CLIENT_SECRET } = process.env

class DiscordService {
  constructor(authorization) {
    this._headers = { authorization }
  }

  static async initialize(code) {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: DISCORD_APP_CLIENT_ID,
        client_secret: DISCORD_APP_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        scope: 'identify guilds',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (response.status !== 200) {
      throw new Error(JSON.stringify(response))
    }

    const oauth = await response.json()
    const authorization = `${oauth.token_type} ${oauth.access_token}`

    return new DiscordService(authorization)
  }

  static getVerifiedAddress(digest, signature) {
    return ethers.utils.verifyMessage(digest, signature)
  }

  prepareDataForIssuing(rawServersList) {
    return rawServersList.map((server) => ({
      servername: server.name,
      serverid: server.icon,
      servericon: server.id,
    }))
  }

  async getUserData() {
    return this.executeGet('https://discord.com/api/users/@me')
  }

  async getUserServers() {
    return this.executeGet('https://discord.com/api/users/@me/guilds')
  }

  async executeGet(url) {
    const response = await fetch(url, { headers: this._headers })

    if (response.status !== 200) {
      throw new Error(JSON.stringify(response))
    }

    const data = await response.json()
    return data
  }
}

module.exports = DiscordService
