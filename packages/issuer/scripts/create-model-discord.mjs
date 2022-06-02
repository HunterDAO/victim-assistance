import { writeFile } from 'node:fs/promises'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'
import { SEED, API_URL } from '../config/index.mjs'

if (!SEED) {
  throw new Error('Missing SEED environment variable')
}

// The seed must be provided as an environment variable
const seed = fromString(SEED, 'base16')
// Create and authenticate the DID
const did = new DID({
  provider: new Ed25519Provider(seed),
  resolver: getResolver(),
})
await did.authenticate()

// Connect to the local Ceramic node
const ceramic = new CeramicClient(API_URL)
ceramic.did = did

// Create a manager for the model
const manager = new ModelManager(ceramic)

// Create the schemas
const discordSchemaID = await manager.createSchema('discord', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'discord',
  type: 'object',
  properties: {
    servers: {
      type: 'array', // Array of all servers
      items: {
        type: 'object',
        title: 'server',
        properties: {
          servername: { type: "string" },
          serverid: { type: "string" },
          servericon: { type: "string" } // To show in the UI: https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png
        },
      },
    },
    issuerDid: {
      type: 'string',
      title: 'issuerDid'
    },
    holderDid: {
      type: 'string',
      title: 'holderDid'
    },
    signature: {
      type: 'string',
      title: 'signature'
    },
    isEncrypted: {
      type: 'boolean',
      title: 'encrypted'
    },
    encryptedKeyHex: {
      type: 'string',
      title: 'encryptedKey'
    },
    accessControlConditions: {
      type: 'string',
      title: 'controlConditions'
    },
  },
})
const discordsSchemaID = await manager.createSchema('discords', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'discordsList',
  type: 'object',
  properties: {
    discords: {
      type: 'array',
      title: 'discords',
      items: {
        type: 'object',
        title: 'discordItem',
        properties: {
          id: {
            $comment: `cip88:ref:${manager.getSchemaURL(discordSchemaID)}`,
            type: 'string',
            pattern: '^ceramic://.+(\\?version=.+)?',
            maxLength: 150,
          },
          title: {
            type: 'string',
            title: 'title',
            maxLength: 100,
          },
        },
      },
    },
  },
})

// Create the definition using the created schema ID
await manager.createDefinition('discords', {
  name: 'discords',
  description: 'discord credentials',
  schema: manager.getSchemaURL(discordsSchemaID),
})

await manager.createTile(
  'placeholderDiscord',
  { taskname: 'This is a placeholder for the discord contents...' },
  { schema: manager.getSchemaURL(discordSchemaID) },
)

// Write model to JSON file
console.log('JSON.stringify(manager.toJSON())!!!', JSON.stringify(manager.toJSON()))
await writeFile(
  new URL('model-discord.json', import.meta.url),
  JSON.stringify(manager.toJSON()),
)
console.log('Encoded model written to scripts/model-discord.json file')
