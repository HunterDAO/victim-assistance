'use strict'
const fetch = require('node-fetch')
const API_URL = 'https://api.coordinape.com/api/v2'
class CoordinApeService {
  constructor({ signature, address, data }) {
    this._signature = signature
    this._address = address
    this._data = data
    this._token = undefined
  }
  setToken(token) {
    this._token = token
  }

  async getToken() {
    const { token } = await fetch(`${API_URL}/login`, {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        signature: this._signature,
        hash: '',
        data: this._data,
        address: this._address,
      }),
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
    }).then((resp) => resp.json())
    return token
  }

  async prepareDataForIssuing(data) {
    const givesAndNotedReceived = data?.circle?.token_gifts
      .map((curr) => {
        return data?.profile?.address === curr.recipient_address
          ? {
              tokens: curr.tokens,
              note: curr.note,
            }
          : null
      })
      .filter(Boolean)
    const givesReceived = givesAndNotedReceived.reduce(
      (acc, curr) => acc + curr.tokens,
      0
    )
    const notes = givesAndNotedReceived.map((curr) => curr.note)
    const collaborators = data?.circle?.users.map((user) => ({
      address: user.address,
      username: user.name,
      avatar: user?.profile?.avatar || '',
    }))
    return {
      date: data?.circle?.circle?.created_at,
      circle: data?.circle?.circle?.name,
      skills: data?.profile?.skills,
      notes,
      givesReceived,
      collaborators,
    }
  }

  async pullData() {
    return await fetch(`${API_URL}/manifest`, {
      headers: {
        authorization: `Bearer ${this._token}`,
      },
      method: 'GET',
    })
      .then((resp) => resp.json())
      .then(this.prepareDataForIssuing)
  }
}

module.exports = CoordinApeService
