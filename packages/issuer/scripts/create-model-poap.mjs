import { writeFile } from 'node:fs/promises'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'
``
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
const poapSchemaID = await manager.createSchema('poap', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'poap',
  type: 'object',
  properties: {
    date: {
      type: 'string',
      format: 'date-time',
      title: 'date', // date issued
      maxLength: 30,
    },
    title: {
      type: 'string',
      title: 'title', // POAP name
    },
    description: {
      type: 'string',
      title: 'description', // POAP long text description
    },
    image: {
      type: 'string',
      title: 'image', // POAP picture URL
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
const poapsSchemaID = await manager.createSchema('poaps', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'poapsList',
  type: 'object',
  properties: {
    poaps: {
      type: 'array',
      title: 'poaps',
      items: {
        type: 'object',
        title: 'poapItem',
        properties: {
          id: {
            $comment: `cip88:ref:${manager.getSchemaURL(poapSchemaID)}`,
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
await manager.createDefinition('poaps', {
  name: 'poaps',
  description: 'POAPs credentials',
  schema: manager.getSchemaURL(poapsSchemaID),
})

await manager.createTile(
  'placeholderPoap',
  { taskname: 'This is a placeholder for the poap contents...' },
  { schema: manager.getSchemaURL(poapSchemaID) },
)

// Write model to JSON file
console.log('JSON.stringify(manager.toJSON())!!!', JSON.stringify(manager.toJSON()))
await writeFile(
  new URL('model-poap.json', import.meta.url),
  JSON.stringify(manager.toJSON()),
)
console.log('Encoded model written to scripts/model-poap.json file')
