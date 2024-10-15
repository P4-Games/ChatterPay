import { Db, ObjectId, Collection, MongoClient } from 'mongodb'

import { getClientPromise } from './mongo-connection'

export function getFormattedId(id: any) {
  if (!id) return ''

  if (typeof id === 'object' && '$oid' in id) {
    return id.$oid
  }
  return id.toString()
}

export function getObjectId(id: any) {
  try {
    if (id.$oid) return new ObjectId(id.$oid.toString())
    return new ObjectId(id.toString())
  } catch {
    return new ObjectId(id)
  }
}

export async function updateOneCommon(
  dbName: string,
  colName: string,
  filter: {},
  setValue: any
): Promise<boolean> {
  let client: MongoClient | undefined

  try {
    client = await getClientPromise()
    const db: Db = client!.db(dbName)
    const collection: Collection = await db.collection(colName)
    const options = { upsert: false }
    const result = await collection.updateOne(filter, setValue, options)

    const matchedDocuments = result ? result.matchedCount : 0
    const modifiedDocuments = result ? result.modifiedCount : 0
    console.info(`updated ${dbName}.${colName}: ${JSON.stringify(setValue)}}.`)
    console.info(
      `updated ${colName}: ${matchedDocuments} document(s) found and ${modifiedDocuments} document(s) updated.`
    )

    return result.modifiedCount > 0 || matchedDocuments > 0
  } finally {
    // NONE
  }
}

export async function upsertOneCommon(
  dbName: string,
  colName: string,
  filter: {},
  setValue: any
): Promise<boolean> {
  let client: MongoClient | undefined

  try {
    client = await getClientPromise()
    const db: Db = client!.db(dbName)
    const collection: Collection = await db.collection(colName)
    const options = { upsert: true } // Habilita la opción upsert

    const updateQuery = { $set: {}, ...setValue }

    // Eliminar $unset si está vacío para evitar problemas con MongoDB
    if (updateQuery.$unset && Object.keys(updateQuery.$unset).length === 0) {
      delete updateQuery.$unset
    }

    const result = await collection.updateOne(filter, setValue, options)

    const upsertedDocuments = result ? result.upsertedCount : 0
    const modifiedDocuments = result ? result.modifiedCount : 0
    console.info(`upserted ${dbName}.${colName}: ${JSON.stringify(setValue)}.`)
    console.info(
      `upserted ${colName}: ${upsertedDocuments} document(s) inserted and ${modifiedDocuments} document(s) updated.`
    )

    return result.upsertedCount > 0 || result.modifiedCount > 0
  } finally {
    // // NONE
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function upsertManyCommon(
  dbName: string,
  colName: string,
  documents: Array<{ filter: {}; update: any }>
): Promise<boolean> {
  let client: MongoClient | undefined

  try {
    client = await getClientPromise()
    const db: Db = client!.db(dbName)
    const collection: Collection = await db.collection(colName)

    // Crear operaciones bulkWrite para upsert
    const operations = documents.map((doc) => ({
      updateOne: {
        filter: doc.filter,
        update: doc.update,
        upsert: true
      }
    }))

    const result = await collection.bulkWrite(operations)

    const upsertedDocuments = result ? result.upsertedCount : 0
    const modifiedDocuments = result ? result.modifiedCount : 0
    console.info(`upserted ${dbName}.${colName} with ${documents.length} operations.`)
    console.info(
      `bulkWrite ${colName}: ${upsertedDocuments} document(s) upserted and ${modifiedDocuments} document(s) modified.`
    )

    return upsertedDocuments > 0 || modifiedDocuments > 0
  } finally {
    // NONE
  }
}
