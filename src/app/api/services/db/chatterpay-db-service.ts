import type { ObjectId, Collection } from 'mongodb'

import { DB_BOT_NAME, DEFAULT_CHAIN_ID, DB_CHATTERPAY_NAME } from 'src/config-global'

import type { JwtPayload } from 'src/types/jwt'
import type { LastUserConversation } from 'src/types/chat'
import type { INFT, IToken, ITransaction } from 'src/types/wallet'
import type { IAccount, UserSession, IAccountWallet } from 'src/types/account'

import { getClientPromise } from './_connections/mongo-connection'
import { getClientPromiseBot } from './_connections/mongo-bot-onnection'
import {
  getObjectId,
  findOneCommon,
  getFormattedId,
  updateOneCommon,
  upsertOneCommon,
  generateObjectId
} from './mongo-service'

// ----------------------------------------------------------------------

const SCHEMA_USERS: string = 'users'
const SCHEMA_TRANSACTIONS: string = 'transactions'
const SCHEMA_NFTS: string = 'nfts'
const SCHEMA_USER_CONVERSATIONS: string = 'user_conversations'
const SCHEMA_TOKENS: string = 'tokens'

// ----------------------------------------------------------------------

export interface IAccountDB {
  _id: string
  name: string
  email?: string
  phone_number: string
  photo: string
  code?: string
  blocked?: boolean
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

/**
 * Wallets a user owns, normalized and ordered with the active chain first.
 * A user accumulates one wallet per network they have operated on; the app
 * operates on the active chain but still shows the others as history.
 * @param {IAccountDB['wallets']} wallets - Raw wallets array from Mongo.
 * @returns {IAccountWallet[]} Normalized wallets, active chain first.
 */
function normalizeWallets(wallets: IAccountDB['wallets']): IAccountWallet[] {
  if (!Array.isArray(wallets)) return []

  return wallets
    .filter((w) => !!w?.wallet_proxy)
    .map((w) => ({
      wallet_proxy: w.wallet_proxy,
      wallet_eoa: w.wallet_eoa,
      chain_id: w.chain_id,
      status: w.status
    }))
    .sort((a, b) => {
      if (a.chain_id === b.chain_id) return 0
      if (a.chain_id === DEFAULT_CHAIN_ID) return -1
      if (b.chain_id === DEFAULT_CHAIN_ID) return 1
      return 0
    })
}

/**
 * Splits a user document into the active-chain wallet plus the full wallet list.
 * Picking by chain matters once a user has wallets on more than one network:
 * `wallets[0]` is whichever chain they used first, not the one the app operates on.
 * @param {IAccountDB['wallets']} wallets - Raw wallets array from Mongo.
 * @returns {{ wallet: string; walletEOA: string; wallets: IAccountWallet[] }} Active wallet and list.
 */
function resolveUserWallets(wallets: IAccountDB['wallets']): {
  wallet: string
  walletEOA: string
  wallets: IAccountWallet[]
} {
  const all = normalizeWallets(wallets)
  // `all` is sorted active-chain-first, so the head is the active wallet when it
  // exists; otherwise fall back to the first one so legacy users keep working.
  const active = all.find((w) => w.chain_id === DEFAULT_CHAIN_ID) ?? all[0]

  return {
    wallet: active?.wallet_proxy || '',
    walletEOA: active?.wallet_eoa || '',
    wallets: all
  }
}

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

  const { wallet, walletEOA, wallets: userWallets } = resolveUserWallets(wallets)

  // Transform the user object to match the old model
  const user: IAccount = {
    id: getFormattedId(_id),
    wallet,
    walletEOA,
    wallets: userWallets,
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

  const { wallet, walletEOA, wallets: userWallets } = resolveUserWallets(wallets)

  // Transform the user data to match the IAccount model
  const user: IAccount = {
    id: getFormattedId(_id), // Add the formatted user ID
    wallet, // Active-chain proxy wallet
    walletEOA, // Active-chain EOA
    wallets: userWallets, // Every wallet, one per chain
    ...rest
  }

  return user
}

/**
 * Whether an account is banned from operating.
 *
 * @param {string} userId - ChatterPay user id.
 * @returns {Promise<boolean>} True when the account is blocked.
 */
export async function isUserBlocked(userId: string): Promise<boolean> {
  try {
    const data = await findOneCommon(
      DB_CHATTERPAY_NAME,
      SCHEMA_USERS,
      { _id: getObjectId(userId) },
      { blocked: 1 }
    )
    return data?.blocked === true
  } catch (error) {
    console.error('isUserBlocked', userId, error.message)
    return false
  }
}

export async function getUserIdByWallet(userWallet: string): Promise<string | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  const data: IAccountDB | null = await db.collection(SCHEMA_USERS).findOne({
    wallets: {
      $elemMatch: {
        $or: [{ wallet_eoa: userWallet }, { wallet_proxy: userWallet }]
      }
    }
  })

  if (!data) {
    return undefined
  }

  return getFormattedId(data._id)
}

/**
 * Every proxy wallet a user owns, one per chain. Used by the read-only views
 * that aggregate history across networks (NFTs, transactions).
 * @param {string} userId - ChatterPay user id.
 * @returns {Promise<string[]>} Proxy wallet addresses, active chain first.
 */
export async function getUserWalletAddresses(userId: string): Promise<string[]> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  const data: IAccountDB | null = await db
    .collection(SCHEMA_USERS)
    .findOne({ _id: getObjectId(userId) })

  if (!data) return []

  return normalizeWallets(data.wallets).map((w) => w.wallet_proxy)
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

export async function createUserSession(
  userId: string,
  token: string,
  ip: string,
  validTimeMinutes: number
): Promise<boolean> {
  const now = new Date()
  const expirationDate = new Date(now.getTime() + validTimeMinutes * 60 * 1000)

  const sessionData = {
    id: generateObjectId(),
    creationDate: now,
    expirationDate,
    token,
    status: 'created',
    ip
  }

  await upsertOneCommon(
    DB_CHATTERPAY_NAME,
    SCHEMA_USERS,
    { _id: getObjectId(userId) },
    { $setOnInsert: { front: { sessions: [] } } }
  )

  const result = await updateOneCommon(
    DB_CHATTERPAY_NAME,
    SCHEMA_USERS,
    { _id: getObjectId(userId) },
    { $push: { 'front.sessions': sessionData } }
  )

  return result
}

export async function checkUserHaveActiveSession(
  userId: string,
  jwtToken: JwtPayload,
  ip: string
): Promise<boolean> {
  try {
    // Retrieve only the "front.sessions" field for the given user
    const user = await findOneCommon(
      DB_CHATTERPAY_NAME,
      SCHEMA_USERS,
      { _id: getObjectId(userId) },
      { 'front.sessions': 1 }
    )

    // Validate if user or sessions exist
    if (!user || !user.front?.sessions || user.front.sessions.length === 0) {
      return false
    }

    // Check if there is a matching session with the given sessionId and token
    const matchingSession = user.front.sessions.find(
      (session: any) =>
        getFormattedId(session.id) === jwtToken.sessionId &&
        session.token === jwtToken.accessToken &&
        session.status === 'active'
    )

    if (!matchingSession) {
      return false
    }

    // IP changes mid-session are expected (carrier NAT, dual-stack, WiFi/mobile switch).
    // Per OWASP, treat as security signal: log and track, don't terminate the session.
    const lastKnownIp = matchingSession.lastIp ?? matchingSession.ip
    if (ip && ip !== lastKnownIp) {
      console.warn(
        `session IP changed for user ${userId}, session ${jwtToken.sessionId}: ${lastKnownIp} -> ${ip}`
      )
      await updateUserSessionIp(userId, jwtToken.sessionId, ip)
    }

    return true
  } catch (error) {
    console.error('checkUserHaveActiveSession', userId, error.message)
  }
  return false
}

/**
 * Tracks a mid-session client IP change: updates the session's lastIp and
 * appends the new IP to its ipHistory (capped to the last 20 entries).
 */
export async function updateUserSessionIp(
  userId: string,
  sessionId: string,
  newIp: string
): Promise<boolean> {
  const result = await updateOneCommon(
    DB_CHATTERPAY_NAME,
    SCHEMA_USERS,
    {
      _id: getObjectId(userId),
      'front.sessions.id': getObjectId(sessionId)
    },
    {
      $set: { 'front.sessions.$.lastIp': newIp },
      $push: {
        'front.sessions.$.ipHistory': { $each: [{ ip: newIp, at: new Date() }], $slice: -20 }
      }
    }
  )

  return result
}

/**
 * Returns the user's session matching the given sessionId, or null if not found.
 */
export async function getUserSession(
  userId: string,
  sessionId: string
): Promise<UserSession | null> {
  try {
    const user = await findOneCommon(
      DB_CHATTERPAY_NAME,
      SCHEMA_USERS,
      { _id: getObjectId(userId) },
      { 'front.sessions': 1 }
    )

    if (!user || !user.front?.sessions) {
      return null
    }

    const session = user.front.sessions.find((item: any) => getFormattedId(item.id) === sessionId)

    return session ?? null
  } catch (error) {
    console.error('getUserSession', userId, error.message)
    return null
  }
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
export async function validateUserHave1SessionCreated(
  userId: string,
  ip: string
): Promise<{ valid: boolean; error: string; session: UserSession | {} }> {
  try {
    // Retrieve the user's sessions from the database using findOneCommon
    const user = await findOneCommon(
      DB_CHATTERPAY_NAME,
      SCHEMA_USERS,
      { _id: getObjectId(userId) },
      { 'front.sessions': 1 }
    )

    // Check if the user has any sessions stored
    if (!user || !user.front?.sessions || user.front.sessions.length === 0) {
      return { valid: false, error: 'NO_SESSIONS', session: {} }
    }

    const now = new Date()

    // Convert MongoDB date format and find an active session
    const activeSession = user.front.sessions.find((session: any) => {
      const sessionExpirationDate = new Date(
        session.expirationDate?.$date || session.expirationDate
      )
      return session.status === 'created' && session.ip === ip && sessionExpirationDate > now
    })

    if (!activeSession) {
      // Check if there's at least one session that matches but has expired
      const expiredSession = user.front.sessions.find((session: any) => {
        const sessionExpirationDate = new Date(
          session.expirationDate?.$date || session.expirationDate
        )
        return session.status === 'created' && session.ip === ip && sessionExpirationDate <= now
      })

      return {
        valid: false,
        error: expiredSession ? 'SESSION_EXPIRED' : 'NO_SESSIONS',
        session: {}
      }
    }

    return { valid: true, error: '', session: activeSession }
  } catch (error) {
    console.error('validateUserHave1SessionCreated', userId, error.message)

    return { valid: false, error: error.message, session: {} }
  }
}

export async function updateUserSessionStatus(
  userId: string,
  sessionId: string,
  status: string
): Promise<boolean> {
  // Ensure status is valid (optional validation)
  const validStatuses = ['created', 'active', 'expired', 'terminated']
  if (!validStatuses.includes(status)) {
    console.error(`Invalid session status: ${status}`)
    return false
  }

  // Update the session status for the given user and session ID
  const result = await updateOneCommon(
    DB_CHATTERPAY_NAME,
    SCHEMA_USERS,
    {
      _id: getObjectId(userId),
      'front.sessions.id': getObjectId(sessionId)
    },
    {
      $set: { 'front.sessions.$.status': status }
    }
  )

  return result
}

export async function getWalletNfts(wallet: string | string[]): Promise<INFT[] | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  // A single wallet belongs to a single chain, so passing every wallet of the
  // user is what returns their NFTs across all the networks they operated on.
  const wallets = Array.isArray(wallet) ? wallet : [wallet]
  if (wallets.length === 0) return undefined

  const cursor: INFTDB[] | null = await db
    .collection(SCHEMA_NFTS)
    .aggregate([
      {
        $match: {
          wallet: { $in: wallets }
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
          copy_order_original: 1,
          minted_contract_address: 1,
          chain_id: 1
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
        // del registro original relacionado. El id de un token solo es único
        // dentro de una red, así que el original tiene que buscarse en la misma
        // chain: si no, una copia puede tomar el total de un NFT ajeno que
        // comparte su id en otra red.
        $lookup: {
          from: SCHEMA_NFTS,
          let: { originalId: '$copy_of_original', chainId: '$chain_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$id', '$$originalId'] }, { $eq: ['$chain_id', '$$chainId'] }]
                }
              }
            },
            { $project: { total_of_this: 1 } }
          ],
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

/**
 * Finds an NFT by its on-chain token id.
 *
 * Token ids restart from zero on every network, so the id on its own does not
 * identify an NFT: the same id exists on more than one chain. The active
 * network wins, and only if the id is unknown there do we fall back to the most
 * recent match on any other network, so links shared before a network switch
 * keep resolving to the NFT they were created for.
 */
export async function getNftById(nftId: string, chainId?: number): Promise<INFT | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)
  const collection = db.collection(SCHEMA_NFTS)

  const nftOnChain: INFT | null = await collection.findOne({
    id: nftId,
    chain_id: chainId ?? DEFAULT_CHAIN_ID
  })

  const nft: INFT | null =
    nftOnChain ?? (await collection.findOne({ id: nftId }, { sort: { timestamp: -1 } }))

  if (!nft) {
    return undefined
  }

  return nft
}

export async function getWalletNft(wallet: string, nftId: string): Promise<INFT | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  // Token ids are stored as strings; a wallet belongs to a single chain, so the
  // wallet is what scopes the lookup to one network.
  const nft: INFTDB | null = await db.collection(SCHEMA_NFTS).findOne({
    wallet,
    id: String(nftId)
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
    minted_contract_address: nft.minted_contract_address,
    metadata: nft.metadata
  }

  return result
}

export async function getUserTransactions(
  wallet: string | string[],
  opts?: { limit?: number; since?: string | number | Date }
): Promise<ITransaction[] | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  // Base ownership filter. Passing every wallet of the user aggregates the
  // history of all the networks they operated on into a single timeline.
  const wallets = Array.isArray(wallet) ? wallet : [wallet]
  if (wallets.length === 0) return undefined

  const match: Record<string, any> = {
    $or: [{ wallet_from: { $in: wallets } }, { wallet_to: { $in: wallets } }]
  }

  // Incremental fetch: only return records newer than `since`. The bot writes `date`
  // as a BSON Date, but tolerate epoch-ms / ISO inputs by coercing to a Date.
  if (opts?.since != null) {
    const sinceDate =
      opts.since instanceof Date
        ? opts.since
        : typeof opts.since === 'number'
          ? new Date(opts.since)
          : new Date(String(opts.since))
    if (!Number.isNaN(sinceDate.getTime())) {
      match.date = { $gt: sinceDate }
    }
  }

  // Bound the result set. Callers fetch a small "head" (newest N) instead of the
  // entire history; old records don't change so the client merges them from cache.
  const limit =
    opts?.limit != null && Number.isFinite(opts.limit) && opts.limit > 0
      ? Math.min(Math.floor(opts.limit), 500)
      : undefined

  const cursor: ITransactionDB[] | null = await db
    .collection(SCHEMA_TRANSACTIONS)
    .aggregate([
      {
        $match: match
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
          contact_from_phone: { $ifNull: ['$contact_from_user.phone_number', '$wallet_from'] }, // ifNull => Case: External wallet
          contact_from_name: { $ifNull: ['$contact_from_user.name', ''] },
          contact_from_avatar_url: {
            $ifNull: ['$contact_from_user.photo', '/assets/images/home/logo.png']
          },
          wallet_to: 1,
          contact_to_phone: { $ifNull: ['$contact_to_user.phone_number', '$wallet_to'] }, // ifNull => Case: External wallet
          contact_to_name: { $ifNull: ['$contact_to_user.name', ''] },
          contact_to_avatar_url: {
            $ifNull: ['$contact_to_user.photo', '/assets/images/home/logo.png']
          },
          token: 1,
          amount: 1,
          fee: 1,
          network_fee: 1,
          network_fee_token: 1,
          attached_ada: 1,
          type: 1,
          status: 1,
          trx_hash: 1,
          user_notes: 1,
          chain_id: 1,
          polymarket_market_slug: 1,
          polymarket_purchase_id: 1,
          polymarket_order_id: 1,
          polymarket_size: 1,
          polymarket_bridge_tx_hash: 1,
          polymarket_bridge_amount: 1,
          polymarket_bridge_token: 1
        }
      },
      {
        $sort: { date: -1 }
      },
      ...(limit != null ? [{ $limit: limit }] : [])
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

export async function getTokens(): Promise<IToken[] | undefined> {
  const client = await getClientPromise()
  const db = client.db(DB_CHATTERPAY_NAME)

  const tokens = await db.collection(SCHEMA_TOKENS).find({}).toArray()

  if (!tokens || tokens.length === 0) {
    return undefined
  }

  return tokens.map((token: any) => ({
    _id: getFormattedId(token._id),
    name: token.name,
    chain_id: token.chain_id,
    decimals: token.decimals,
    address: token.address,
    symbol: token.symbol,
    logo: token.logo,
    type: token.type,
    ramp_enabled: token.ramp_enabled,
    display_decimals: token.display_decimals,
    display_symbol: token.display_symbol,
    operations_limits: token.operations_limits
  }))
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
