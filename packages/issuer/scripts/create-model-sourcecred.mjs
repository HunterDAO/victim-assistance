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
const scSchemaID = await manager.createSchema('sc', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'sourcecred',
  type: 'object',
  properties: {
    date: {
      type: 'string',
      format: 'date-time',
      title: 'date', // Issuance date
      maxLength: 30,
    },
    instance: {
      type: 'string',
      title: 'instance' // Name of SourceCred instance, organization, DAO
    },
    credScore: {
      type: 'number',
      title: 'credScore' // Cred score of the user
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
const scsSchemaID = await manager.createSchema('sourcecreds', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'scsList',
  type: 'object',
  properties: {
    scs: {
      type: 'array',
      title: 'sourcecreds',
      items: {
        type: 'object',
        title: 'scItem',
        properties: {
          id: {
            $comment: `cip88:ref:${manager.getSchemaURL(scSchemaID)}`,
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
await manager.createDefinition('sourcecreds', {
  name: 'sourcecreds',
  description: 'SrouceCred credentials',
  schema: manager.getSchemaURL(scsSchemaID),
})

await manager.createTile(
  'placeholderSourceCred',
  { taskname: 'This is a placeholder for the sourcecred contents...' },
  { schema: manager.getSchemaURL(scSchemaID) },
)

// Write model to JSON file
console.log('JSON.stringify(manager.toJSON())!!!', JSON.stringify(manager.toJSON()))
await writeFile(
  new URL('model-sourcecred.json', import.meta.url),
  JSON.stringify(manager.toJSON()),
)
console.log('Encoded model written to scripts/model-sourcecred.json file')
