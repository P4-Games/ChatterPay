import { Db, MongoClient, ServerApiVersion } from 'mongodb'

import { NODE_ENV, USE_MOCK, MONGODB_BOT } from 'src/config-global'

type DatabaseLogic<T> = (db: Db) => Promise<T>

const uri: string | undefined = MONGODB_BOT
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
}
let clientBot: MongoClient
let clientPromiseBot: any

if (!USE_MOCK) {
  if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local')
  }

  if (NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    // @ts-ignore
    if (!global._mongoClientPromiseBot) {
      clientBot = new MongoClient(uri, options)
      // @ts-ignore
      global._mongoClientPromiseBot = clientBot.connect()
    }
    // @ts-ignore
    clientPromiseBot = global._mongoClientPromiseBot
  } else {
    // In production mode, it's best to not use a global variable.
    clientBot = new MongoClient(uri, options)
    clientPromiseBot = clientBot.connect()
  }
}

export function getClientPromiseBot() {
  return clientPromiseBot
}

export async function closeConnectionBot() {
  if (clientBot && NODE_ENV !== 'development') {
    try {
      // await client.close()
    } catch (ex) {
      console.error(ex)
    }
  }
}

export async function withDatabaseBOt<T>(logic: DatabaseLogic<T>, dbName: string): Promise<T> {
  let _client: MongoClient | null = null
  try {
    _client = await getClientPromiseBot()
    const db = _client!.db(dbName)
    return await logic(db)
  } finally {
    await closeConnectionBot()
  }
}
