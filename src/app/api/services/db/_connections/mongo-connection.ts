import { type Db, MongoClient, ServerApiVersion } from 'mongodb'

import { MONGODB, NODE_ENV, USE_MOCK } from 'src/config-global'

// ----------------------------------------------------------------------

type DatabaseLogic<T> = (db: Db) => Promise<T>

const uri: string | undefined = MONGODB
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
}
let client: MongoClient
let clientPromise: any

// ----------------------------------------------------------------------

if (!USE_MOCK) {
  if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local')
  }

  if (NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    // @ts-expect-error "error-expected"
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options)
      // @ts-expect-error "error-expected"
      global._mongoClientPromise = client.connect()
    }
    // @ts-expect-error "error-expected"
    clientPromise = global._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export function getClientPromise() {
  return clientPromise
}

export async function closeConnection() {
  if (client && NODE_ENV !== 'development') {
    try {
      // await client.close()
    } catch (ex) {
      console.error(ex)
    }
  }
}

export async function withDatabase<T>(logic: DatabaseLogic<T>, dbName: string): Promise<T> {
  let _client: MongoClient | null = null
  try {
    _client = await getClientPromise()
    const db = _client!.db(dbName)
    return await logic(db)
  } finally {
    await closeConnection()
  }
}
