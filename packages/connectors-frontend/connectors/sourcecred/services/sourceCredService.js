'use strict'

const { SOURCE_CRED_INSTANCE_DOMAIN } = process.env
const sc = require('sourcecred').sourcecred

class SourceCredService {
  constructor() {
    this._instance = sc.instance.readInstance.getNetworkReadInstance(
      SOURCE_CRED_INSTANCE_DOMAIN
    )
  }

  async pullData() {
    const response = await this._instance.readCredGrainView()
    return response
  }

  prepareDataForIssuer(participants, identifiers) {
    const participantEntities = this.findParticipant(participants, identifiers)
    const credScore = participantEntities.reduce(
      (acc, curr) => acc + curr.cred,
      0
    )
    return {
      credScore,
      instance: SOURCE_CRED_INSTANCE_DOMAIN,
    }
  }

  findParticipant(participants, identifiers) {
    const participant = participants.filter((p) =>
      identifiers.includes(p.identity.name)
    )

    return participant
  }
}

module.exports = SourceCredService
