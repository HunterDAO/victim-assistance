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
const colonySchemaID = await manager.createSchema('colony', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'colony',
  type: 'object',
  properties: {
    reputations: {
      type: 'array', // Array of all user's colonies and their reputation
      items: {
        type: 'object',
        title: 'reputation',
        properties: {
          colonyname: { type: "string" }, // String, name of the colony
          colonyaddress: { type: "string" }, // xDai contract address of colony
          reputation: { type: "string" } // reputation score, 0-100%
        }
      }
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
const coloniesSchemaID = await manager.createSchema('colonies', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'coloniesList',
  type: 'object',
  properties: {
    colonies: {
      type: 'array',
      title: 'colonies',
      items: {
        type: 'object',
        title: 'colonyItem',
        properties: {
          id: {
            $comment: `cip88:ref:${manager.getSchemaURL(colonySchemaID)}`,
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
await manager.createDefinition('colonies', {
  name: 'colonies',
  description: 'colony credentials',
  schema: manager.getSchemaURL(coloniesSchemaID),
})

await manager.createTile(
  'placeholderColony',
  { taskname: 'This is a placeholder for the colony contents...' },
  { schema: manager.getSchemaURL(colonySchemaID) },
)

// Write model to JSON file
console.log('JSON.stringify(manager.toJSON())!!!', JSON.stringify(manager.toJSON()))
await writeFile(
  new URL('model-colony.json', import.meta.url),
  JSON.stringify(manager.toJSON()),
)
console.log('Encoded model written to scripts/model-colony.json file')
