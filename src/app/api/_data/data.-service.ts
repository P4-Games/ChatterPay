import { IAccount } from 'src/types/account'
import { ITransaction } from 'src/types/wallet'

import { getClientPromise } from './mongo-connection'
import { getObjectId, getFormattedId, updateOneCommon } from './mongo-utils'

// ----------------------------------------------------------------------

const DB_NAME: string = 'chatterpay'
const SCHEMA_USERS: string = 'users'
const SCHEMA_TRANSACTIONS: string = 'transactions'

// ----------------------------------------------------------------------

interface IAccountDB extends Omit<IAccount, 'id'> {
  _id: any
}
interface ITransactionDB extends Omit<ITransaction, 'id'> {
  _id: any
}
export async function getUserByPhone(phone: string): Promise<IAccount | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_NAME)

  // Intenta encontrar el número de teléfono completo
  let data: IAccountDB | null = await db.collection(SCHEMA_USERS).findOne({ phone_number: phone })

  // Si no se encuentra, intenta buscar por los últimos 8 caracteres del número de teléfono
  if (!data) {
    const last8Chars = phone.slice(-8) // Obtiene los últimos 8 caracteres del número de teléfono
    const partialPhoneRegex = new RegExp(last8Chars, 'i')
    data = await db
      .collection(SCHEMA_USERS)
      .findOne({ phone_number: { $regex: partialPhoneRegex } })
  }

  if (!data) {
    return undefined
  }

  const { _id, ...rest } = data
  const user: IAccount = { id: getFormattedId(_id), ...rest }
  return user
}

export async function getUserById(id: string): Promise<IAccount | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_NAME)

  const data: IAccountDB | null = await db
    .collection(SCHEMA_USERS)
    .findOne({ _id: getObjectId(id) })

  if (!data) {
    return undefined
  }

  const { _id, ...rest } = data
  const user: IAccount = { id: getFormattedId(_id), ...rest }
  return user
}

export async function updateUserCode(userId: string, code: number): Promise<boolean> {
  const setValue = { $set: { code } }
  const result = await updateOneCommon(
    DB_NAME,
    SCHEMA_USERS,
    { _id: getObjectId(userId) },
    setValue
  )
  return result
}

export async function geUserTransactions(wallet: string): Promise<ITransaction[] | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_NAME)

  const cursor: ITransactionDB[] | null = await db
    .collection(SCHEMA_TRANSACTIONS)
    .aggregate([
      {
        $match: {
          $or: [{ wallet_from: wallet }, { wallet_to: wallet }]
        }
      },
      {
        $lookup: {
          from: SCHEMA_USERS,
          localField: 'wallet_from',
          foreignField: 'wallet',
          as: 'contact_from_user'
        }
      },
      {
        $lookup: {
          from: SCHEMA_USERS,
          localField: 'wallet_to',
          foreignField: 'wallet',
          as: 'contact_to_user'
        }
      },
      {
        $unwind: {
          path: '$contact_from_user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$contact_to_user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          date: 1,
          wallet_from: 1,
          contact_from_phone: { $ifNull: ['$contact_from_user.phone_number', null] },
          contact_from_name: { $ifNull: ['$contact_from_user.name', null] },
          contact_from_avatar_url: { $ifNull: ['$contact_from_user.photo', null] },
          wallet_to: 1,
          contact_to_phone: { $ifNull: ['$contact_to_user.phone_number', null] },
          contact_to_name: { $ifNull: ['$contact_to_user.name', null] },
          contact_to_avatar_url: { $ifNull: ['$contact_to_user.photo', null] },
          token: 1,
          amount: 1,
          type: 1,
          status: 1,
          trx_hash: 1
        }
      }
    ])
    .toArray()

  if (!cursor || cursor.length === 0) {
    return undefined
  }

  const transactions: ITransaction[] = cursor.map(({ _id, ...rest }) => ({
    id: getFormattedId(_id),
    ...rest
  }))

  return transactions
}
