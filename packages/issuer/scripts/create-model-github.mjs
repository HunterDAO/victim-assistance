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
const githubSchemaID = await manager.createSchema('github', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'github',
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: 'username', // Github username
    },
    repos: {
      type: 'array', // Array of Repositories
      items: {
        type: 'string',
      }
    },
    languages: {
      type: 'array', // Array of Languages used (desceding popularity order)
      items: {
        type: 'string'
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
const githubsSchemaID = await manager.createSchema('githubs', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'githubsList',
  type: 'object',
  properties: {
    githubs: {
      type: 'array',
      title: 'githubs',
      items: {
        type: 'object',
        title: 'githubItem',
        properties: {
          id: {
            $comment: `cip88:ref:${manager.getSchemaURL(githubSchemaID)}`,
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
await manager.createDefinition('githubs', {
  name: 'githubs',
  description: 'github credentials',
  schema: manager.getSchemaURL(githubsSchemaID),
})

await manager.createTile(
  'placeholderGithub',
  { taskname: 'This is a placeholder for the github contents...' },
  { schema: manager.getSchemaURL(githubSchemaID) },
)

// Write model to JSON file
console.log('JSON.stringify(manager.toJSON())!!!', JSON.stringify(manager.toJSON()))
await writeFile(
  new URL('model-github.json', import.meta.url),
  JSON.stringify(manager.toJSON()),
)
console.log('Encoded model written to scripts/model-github.json file')
