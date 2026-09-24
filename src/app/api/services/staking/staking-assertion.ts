import crypto from 'crypto'

import { CARDANO_STAKING_BFF_SECRET } from 'src/config-global'

// ----------------------------------------------------------------------

/**
 * The signature that tells the backend this request came from a session we authenticated.
 *
 * Every other call to the backend proves only that the caller holds the shared internal token, and
 * names the user in the body. The backend cannot tell that apart from anything else that got hold of
 * the token and picked a phone number. For a transfer that risk is already accepted; for deregistering
 * a credential or moving a whole balance it should not be.
 *
 * So the routes that mutate a staking position sign what they resolved. The phone number in the
 * signature is the one this route read from the session cookie — never one the browser supplied — and
 * the action is inside the signature too, so a captured assertion cannot be replayed against a
 * different operation or a different destination.
 *
 * This module runs only on the server. The secret is shared with the backend and with nothing else, and
 * it must never reach a browser bundle: it is read from a non-`NEXT_PUBLIC_` variable, which Next.js
 * will not inline into client code.
 *
 * The canonical form is duplicated between here and the backend on purpose. Sharing it would mean one
 * of the two signing for the other, and the whole point is that only the side which authenticated the
 * session can produce the signature.
 */

/** How long an assertion is accepted. One request, not a session. */
const TTL_SECONDS = 120

type StakingAssertionClaims = {
  v: 1
  sub: string
  act: string
  rcp: string | null
  nonce: string
  iat: number
  exp: number
}

/**
 * Formats a phone number the way the backend does before signing or comparing it.
 *
 * Kept deliberately narrow: strip everything that is not a digit. Both sides have to agree, and the
 * backend's own formatter is the reference — a mismatch here shows up as a rejected assertion rather
 * than as a security hole, which is the failure direction to prefer.
 */
function formatPhone(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '')
}

/**
 * The exact string both sides sign.
 *
 * Fixed field order and a delimiter that cannot appear in any field. Signing a JSON object instead
 * would make the signature depend on key order and on how each runtime spells a number.
 */
function canonical(claims: StakingAssertionClaims): string {
  return [
    claims.v,
    claims.sub,
    claims.act,
    claims.rcp ?? '-',
    claims.nonce,
    claims.iat,
    claims.exp
  ].join('|')
}

// ----------------------------------------------------------------------

/**
 * Signs an assertion for one action on behalf of one user.
 *
 * @param phoneNumber - The phone number this route resolved from the session.
 * @param action - The action being asked for.
 * @param recipientAddress - An exit's destination, or `null`.
 * @returns The assertion, or `null` when no secret is configured — in which case the backend refuses
 *   the request unless it has been explicitly told not to require one.
 */
export function signStakingAssertion(
  phoneNumber: string,
  action: string,
  recipientAddress: string | null = null
): string | null {
  const secret = (CARDANO_STAKING_BFF_SECRET ?? '').trim()
  if (secret === '') return null

  const seconds = Math.floor(Date.now() / 1000)
  const claims: StakingAssertionClaims = {
    v: 1,
    sub: formatPhone(phoneNumber),
    act: action,
    rcp: recipientAddress ?? null,
    nonce: crypto.randomBytes(16).toString('hex'),
    iat: seconds,
    exp: seconds + TTL_SECONDS
  }

  const payload = Buffer.from(JSON.stringify(claims), 'utf8').toString('base64url')
  const signature = crypto
    .createHmac('sha256', secret)
    .update(canonical(claims))
    .digest('base64url')
  return `${payload}.${signature}`
}
