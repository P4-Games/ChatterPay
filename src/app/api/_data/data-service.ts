import { ObjectId, Collection } from 'mongodb'

import { DB_CHATTERPAY_NAME } from 'src/config-global'

import { IAccount } from 'src/types/account'
import { LastUserConversation } from 'src/types/chat'
import { INFT, ITransaction } from 'src/types/wallet'

import { getClientPromise } from './mongo-connection'
import { getClientPromiseBot } from './mongo-connection-bot'
import { getObjectId, getFormattedId, updateOneCommon } from './mongo-utils'

// ----------------------------------------------------------------------

const SCHEMA_USERS: string = 'users'
const SCHEMA_TRANSACTIONS: string = 'transactions'
const SCHEMA_NFTS: string = 'nfts'

const DB_BOT_NAME: string = 'chatterpay'
const SCHEMA_USER_CONVERSATIONS: string = 'user_conversations'

// ----------------------------------------------------------------------

export interface IAccountDB {
  _id: string
  name: string
  email?: string
  phone_number: string
  photo: string
  code?: string
  settings: {
    notifications: {
      language: string
    }
  }
  wallets: {
    wallet_proxy: string
    wallet_eoa: string
    chain_id: number
    status: string
  }[]
  operations_in_progress: {
    mint_nft: number
    mint_nft_copy: number
    swap: number
    transfer: number
    withdraw_all: number
  }
}

interface ITransactionDB extends Omit<ITransaction, 'id'> {
  _id: any
}
interface INFTDB extends Omit<INFT, 'bddId' | 'nftId'> {
  _id: any // bdd id
  id: string // nft id
}

interface UserConversation {
  _id: ObjectId
  channel_user_id: string
  phone_number: string
  last_message_ts: Date
}

// ----------------------------------------------------------------------

export async function getUserByPhone(phone: string): Promise<IAccount | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

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

  const { _id, wallets, ...rest } = data

  // Assuming that wallets is an array and we're only taking the first wallet
  const wallet = wallets && wallets.length > 0 ? wallets[0].wallet_proxy : ''
  const walletEOA = wallets && wallets.length > 0 ? wallets[0].wallet_eoa : ''

  // Transform the user object to match the old model
  const user: IAccount = {
    id: getFormattedId(_id),
    wallet,
    walletEOA,
    ...rest
  }
  return user
}

export async function getUserById(id: string): Promise<IAccount | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  const data: IAccountDB | null = await db
    .collection(SCHEMA_USERS)
    .findOne({ _id: getObjectId(id) })

  if (!data) {
    return undefined
  }

  // Destructure _id and other properties from the user data
  const { _id, wallets, ...rest } = data

  // If wallets exist, extract the first wallet's wallet_proxy and wallet_eoa
  const wallet = wallets && wallets.length > 0 ? wallets[0].wallet_proxy : ''
  const walletEOA = wallets && wallets.length > 0 ? wallets[0].wallet_eoa : ''

  // Transform the user data to match the IAccount model
  const user: IAccount = {
    id: getFormattedId(_id), // Add the formatted user ID
    wallet, // Add wallet
    walletEOA, // Add walletEOA
    ...rest
  }

  return user
}

export async function updateUserCode(userId: string, code: number | undefined): Promise<boolean> {
  const setValue = { $set: { code } }
  const result = await updateOneCommon(
    DB_CHATTERPAY_NAME,
    SCHEMA_USERS,
    { _id: getObjectId(userId) },
    setValue
  )
  return result
}

export async function updateUser(contact: IAccount): Promise<boolean> {
  const filter = { _id: getObjectId(contact.id) }
  const updateData = { name: contact.name }
  const setValue = { $set: updateData }
  const result: boolean = await updateOneCommon(DB_CHATTERPAY_NAME, SCHEMA_USERS, filter, setValue)
  return result
}

export async function updateUserEmail(contact: IAccount): Promise<boolean> {
  const filter = { _id: getObjectId(contact.id) }
  const updateData = { email: contact.email }
  const setValue = { $set: updateData }
  const result: boolean = await updateOneCommon(DB_CHATTERPAY_NAME, SCHEMA_USERS, filter, setValue)
  return result
}

export async function getWalletNfts(wallet: string): Promise<INFT[] | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  const cursor: INFTDB[] | null = await db
    .collection(SCHEMA_NFTS)
    .aggregate([
      {
        $match: {
          wallet
        }
      },
      {
        $project: {
          _id: 1, // bddId
          id: 1, // nftId
          channel_user_id: 1,
          wallet: 1,
          trxId: 1,
          metadata: 1,
          timestamp: 1,
          original: 1,
          total_of_this: 1,
          copy_of: 1,
          copy_order: 1,
          copy_of_original: 1,
          copy_order_original: 1
        }
      },
      {
        $addFields: {
          // Obtener el campo copy_of, si es nulo lo dejamos como nulo
          copy_of: {
            $ifNull: ['$copy_of', null]
          },
          // Obtener el campo copy_of_original, si es nulo lo dejamos como nulo
          copy_of_original: {
            $ifNull: ['$copy_of_original', null]
          }
        }
      },
      {
        // Realizar un lookup para obtener el total_of_this
        // del registro original relacionado
        $lookup: {
          from: SCHEMA_NFTS,
          localField: 'copy_of_original',
          foreignField: 'id',
          as: 'original_nft'
        }
      },
      {
        $addFields: {
          total_of_original: {
            $cond: {
              if: { $ne: ['$copy_of_original', null] },
              then: {
                $arrayElemAt: ['$original_nft.total_of_this', 0]
              },
              else: '$total_of_this'
            }
          }
        }
      },
      {
        $sort: {
          timestamp: -1 // Orden descendente por timestamp
        }
      }
    ])
    .toArray()

  if (!cursor || cursor.length === 0) {
    return undefined
  }

  const nfts: INFT[] = cursor.map(({ _id, id, ...rest }) => ({
    bddId: getFormattedId(_id),
    nftId: id,
    ...rest
  }))

  return nfts
}

export async function getNftById(nftId: string): Promise<INFT | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  const nft: INFT | null = await db.collection(SCHEMA_NFTS).findOne({
    id: nftId
  })

  if (!nft) {
    return undefined
  }

  return nft
}

export async function getWalletNft(wallet: string, nftId: string): Promise<INFT | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  const nft: INFTDB | null = await db.collection(SCHEMA_NFTS).findOne({
    wallet,
    id: Number(nftId)
  })

  if (!nft) {
    return undefined
  }

  const result: INFT = {
    bddId: getFormattedId(nft._id),
    nftId: nft.id,
    channel_user_id: nft.channel_user_id,
    wallet: nft.wallet,
    trxId: nft.trxId,
    timestamp: nft.timestamp,
    original: nft.original,
    tota_of_this: nft.tota_of_this,
    copy_of: nft.copy_of,
    copy_order: nft.copy_order,
    copy_of_original: nft.copy_of_original,
    copy_order_original: nft.copy_order_original,
    metadata: nft.metadata
  }

  return result
}

export async function getUserTransactions(wallet: string): Promise<ITransaction[] | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

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
          let: { wallet_from: '$wallet_from' },
          pipeline: [
            { $unwind: '$wallets' },
            { $match: { $expr: { $eq: ['$wallets.wallet_proxy', '$$wallet_from'] } } }
          ],
          as: 'contact_from_user'
        }
      },
      {
        $lookup: {
          from: SCHEMA_USERS,
          let: { wallet_to: '$wallet_to' },
          pipeline: [
            { $unwind: '$wallets' },
            { $match: { $expr: { $eq: ['$wallets.wallet_proxy', '$$wallet_to'] } } }
          ],
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
      },
      {
        $sort: { date: -1 }
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

export async function getLastConversacionUserId(
  channel_user_id: string
): Promise<LastUserConversation> {
  try {
    const client = await getClientPromiseBot()
    const db = await client.db(DB_BOT_NAME)
    const collection = (await db.collection(
      SCHEMA_USER_CONVERSATIONS
    )) as unknown as Collection<UserConversation>

    // Obtiene los últimos 8 caracteres del número de teléfono
    const last8Chars = channel_user_id.slice(-8)
    const partialPhoneRegex = new RegExp(last8Chars, 'i')

    const pipeline = [
      {
        $match: {
          channel_user_id: { $regex: partialPhoneRegex }
        }
      },
      {
        $sort: { last_message_ts: -1 }
      },
      {
        $limit: 1
      },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          channel_user_id: 1,
          phone_number: {
            $ifNull: ['$phone_number', '$channel_user_id']
          }
        }
      }
    ]

    const result = await collection.aggregate<LastUserConversation>(pipeline).toArray()
    return result[0] || null
  } catch (ex) {
    console.error('Error in getLastConversacionUserId', ex)
    throw ex
  }
}
