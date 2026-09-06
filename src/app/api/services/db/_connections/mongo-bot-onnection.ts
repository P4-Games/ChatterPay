import { type Db, MongoClient, ServerApiVersion } from 'mongodb'

import { NODE_ENV, USE_MOCK, MONGODB_BOT } from 'src/config-global'

// ----------------------------------------------------------------------

type DatabaseLogic<T> = (db: Db) => Promise<T>

const uri: string | undefined = MONGODB_BOT
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  },
  // Sockets this instance may hold at once. The driver's default is 100, which is a ceiling
  // written for one long-lived server, not for an autoscaled one: every instance opens its own
  // pool, so the cluster sees the default multiplied by the instance count. Past the cluster's
  // own connection limit Atlas stops answering the handshake, and every login fails at once.
  maxPoolSize: 10,
  // Retire pooled sockets before the load balancer drops them for being idle.
  // Without this the driver hands out a socket the other end already closed and
  // the write fails with EPIPE, which surfaces as a failed login.
  maxIdleTimeMS: 60_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  retryReads: true,
  retryWrites: true
}
let clientBot: MongoClient
let clientPromiseBot: any

// ----------------------------------------------------------------------

if (!USE_MOCK) {
  if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local')
  }

  if (NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    // @ts-expect-error "error-expected"
    if (!global._mongoClientPromiseBot) {
      clientBot = new MongoClient(uri, options)
      // @ts-expect-error "error-expected"
      global._mongoClientPromiseBot = clientBot.connect()
    }
    // @ts-expect-error "error-expected"
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
