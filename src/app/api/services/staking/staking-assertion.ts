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
 * A vote delegation names a target as well as an action, and the target is inside the signature for the
 * same reason: `delegate_vote` on its own does not say whether the voting power goes to abstaining, to
 * a vote of no confidence or to a named representative, and an assertion that left that out would
 * authorise whichever of the three the request happened to carry.
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

/**
 * The shape of the canonical form, as a number inside the signature.
 *
 * Raised when the canonical form gains or loses a field. Version 2 added the governance target, so a
 * version 1 assertion canonicalises its fields into different positions and the backend refuses it
 * outright rather than comparing fields that mean something else. Both sides of this contract ship
 * together, so a mismatch is a half-applied deployment rather than a caller to accommodate.
 */
const ASSERTION_VERSION = 2

type StakingAssertionClaims = {
  v: typeof ASSERTION_VERSION
  sub: string
  act: string
  rcp: string | null
  /** The canonical governance target, or `null` for an action that has none. */
  gov: string | null
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
 * Fixed field order and a delimiter that cannot appear in any field. That last property is why a
 * governance target reaches this function only after `governanceTargetCanonical` has restricted a
 * representative's identifier to lowercase alphanumerics and the underscore: a field able to carry a
 * `|` could be chosen to make two different claim sets produce the same string, and one signature
 * would then verify for both. Signing a JSON object instead would make the signature depend on key
 * order and on how each runtime spells a number.
 */
function canonical(claims: StakingAssertionClaims): string {
  return [
    claims.v,
    claims.sub,
    claims.act,
    claims.rcp ?? '-',
    claims.gov ?? '-',
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
 * @param governanceTarget - The canonical governance target, or `null` for an action that has none.
 * @returns The assertion, or `null` when no secret is configured — in which case the backend refuses
 *   the request unless it has been explicitly told not to require one.
 */
export function signStakingAssertion(
  phoneNumber: string,
  action: string,
  recipientAddress: string | null = null,
  governanceTarget: string | null = null
): string | null {
  const secret = (CARDANO_STAKING_BFF_SECRET ?? '').trim()
  if (secret === '') return null

  const seconds = Math.floor(Date.now() / 1000)
  const claims: StakingAssertionClaims = {
    v: ASSERTION_VERSION,
    sub: formatPhone(phoneNumber),
    act: action,
    rcp: recipientAddress ?? null,
    gov: governanceTarget ?? null,
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
