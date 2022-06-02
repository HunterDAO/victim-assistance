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
const apeProfileSchemaID = await manager.createSchema('ape', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ape',
  type: 'object',
  properties: {
    date: {
      type: 'string',
      format: 'date-time',
      title: 'date', // Issuance date
      maxLength: 30,
    },
    circle: {
      type: 'string',
      title: 'circle', // Name of CoordinApe Circle
    },
    skills: {
      type: 'array',
      title: 'skills', // Array of skills
      items: {
        type: 'string',
      },
    },
    givesReceived: {
      type: 'number',
      title: 'givesRecieved', // Total number of Gives received last epoch
    },
    notes: {
      type: 'array', // Array of all notes received by user during last epoch
      items: {
        type: 'string',
      },
    },
    issuerDid: {
      type: 'string',
      title: 'issuerDid',
    },
    holderDid: {
      type: 'string',
      title: 'holderDid',
    },
    signature: {
      type: 'string',
      title: 'signature',
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
    collaborators: {
      type: 'array',
      items: {
        type: 'object',
        title: 'collaborator',
        properties: {
          username: { type: 'string' },
          avatar: { type: 'string' },
          address: { type: 'string' },
        },
      },
    },
  },
})
const apeProfilesSchemaID = await manager.createSchema('apeprofiles', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'apeprofilesList',
  type: 'object',
  properties: {
    apeprofiles: {
      type: 'array',
      title: 'apeprofiles',
      items: {
        type: 'object',
        title: 'apeprofileItem',
        properties: {
          id: {
            $comment: `cip88:ref:${manager.getSchemaURL(apeProfileSchemaID)}`,
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
await manager.createDefinition('apeprofiles', {
  name: 'apeprofiles',
  description: 'Coordinape profile credentials',
  schema: manager.getSchemaURL(apeProfilesSchemaID),
})

await manager.createTile(
  'placeholderApeProfile',
  { taskname: 'This is a placeholder for the Coordinape profile contents...' },
  { schema: manager.getSchemaURL(apeProfileSchemaID) }
)

// Write model to JSON file
console.log(
  'JSON.stringify(manager.toJSON())!!!',
  JSON.stringify(manager.toJSON())
)
await writeFile(
  new URL('model-ape.json', import.meta.url),
  JSON.stringify(manager.toJSON())
)
console.log('Encoded model written to scripts/model-ape.json file')
