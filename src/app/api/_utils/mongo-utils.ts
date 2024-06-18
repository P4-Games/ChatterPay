import { ObjectId } from 'mongodb'

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
