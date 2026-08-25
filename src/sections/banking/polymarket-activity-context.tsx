'use client'

import type { ReactNode } from 'react'
import { useRef, useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react'

import { useSWRConfig } from 'swr'

import { polymarketPurchaseStatus } from 'src/app/api/hooks/use-polymarket'

// ----------------------------------------------------------------------
// Tracks in-flight Polymarket operations (sells / claims) so the dashboard can
// show an optimistic, status-tracked record the instant the user acts — and keep
// it visible after the drawer closes, across navigation and page reloads (until
// the operation resolves). The provider owns the polling so it never stops when
// the originating component unmounts.
// ----------------------------------------------------------------------

export type PendingOpKind = 'buy' | 'sell' | 'claim'
export type PendingOpStatus = 'processing' | 'completed' | 'failed'

export type PendingOp = {
  id: string
  kind: PendingOpKind
  purchaseId?: string
  posKey?: string
  marketSlug?: string
  marketTitle: string
  outcome?: string
  side?: 'BUY' | 'SELL'
  size?: number
  price?: number
  amount: number
  token: string
  step: string
  status: PendingOpStatus
  error?: string
  createdAt: number
  resolvedAt?: number
}

type StartSellInput = {
  posKey: string
  marketTitle: string
  marketSlug?: string
  outcome: string
  size: number
  price: number
  token?: string
}

type ActivityContextValue = {
  pendingOps: PendingOp[]
  /** Positions currently being sold (posKey set) — used to hide them optimistically. */
  sellingPosKeys: Set<string>
  startSell: (input: StartSellInput) => string
  attachPurchaseId: (id: string, purchaseId: string) => void
  completeOp: (id: string) => void
  failOp: (id: string, error?: string) => void
  addClaim: (amount: number, token?: string) => string
  removeOp: (id: string) => void
}

const ActivityContext = createContext<ActivityContextValue | null>(null)

const POLL_MS = 4000
// No status endpoint exists for claims, so resolve them optimistically after the
// bridge typically settles (mirrors the previous fixed-timeout behaviour).
const CLAIM_RESOLVE_MS = 45000
// Keep resolved rows around briefly so the user sees the final state, then drop
// them (the real backend record takes over in the history by then).
const KEEP_RESOLVED_MS = 90000
// Safety net: drop a stuck "processing" op (e.g. its status is no longer known
// after a reload) so it never spins forever — the real record covers it by then.
const STALE_PROCESSING_MS = 15 * 60 * 1000

const storageKey = (wallet: string) => `cp:pendingOps:${wallet}`

function genId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`
}

function readOps(wallet: string): PendingOp[] {
  if (typeof window === 'undefined' || !wallet) return []
  try {
    const raw = window.localStorage.getItem(storageKey(wallet))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeOps(wallet: string, ops: PendingOp[]) {
  if (typeof window === 'undefined' || !wallet) return
  try {
    window.localStorage.setItem(storageKey(wallet), JSON.stringify(ops))
  } catch {
    /* ignore quota errors */
  }
}

// ----------------------------------------------------------------------

export function PolymarketActivityProvider({
  wallet,
  children
}: {
  wallet: string
  children: ReactNode
}) {
  const { mutate } = useSWRConfig()
  const [pendingOps, setPendingOps] = useState<PendingOp[]>([])

  // Keep a ref in sync so the polling loop reads the latest ops without resubscribing.
  // Synced in an effect (not during render) because React may replay or discard renders.
  const opsRef = useRef<PendingOp[]>([])
  useEffect(() => {
    opsRef.current = pendingOps
  }, [pendingOps])

  // Hydrate from storage when the wallet becomes known / changes.
  useEffect(() => {
    setPendingOps(readOps(wallet))
  }, [wallet])

  // Persist on every change.
  useEffect(() => {
    if (wallet) writeOps(wallet, pendingOps)
  }, [wallet, pendingOps])

  const updateOp = useCallback((id: string, patch: Partial<PendingOp>) => {
    setPendingOps((prev) => prev.map((op) => (op.id === id ? { ...op, ...patch } : op)))
  }, [])

  const removeOp = useCallback((id: string) => {
    setPendingOps((prev) => prev.filter((op) => op.id !== id))
  }, [])

  const revalidateAfterTrade = useCallback(() => {
    const keys = [
      '/positions',
      '/orders',
      '/portfolio',
      '/balance',
      '/trades',
      '/transactions',
      '/markets'
    ]
    for (const sub of keys) {
      mutate(
        (key: any) =>
          Array.isArray(key) && typeof key[0] === 'string' && (key[0] as string).includes(sub)
      )
    }
  }, [mutate])

  const startSell = useCallback((input: StartSellInput): string => {
    const id = genId()
    const op: PendingOp = {
      id,
      kind: 'sell',
      posKey: input.posKey,
      marketTitle: input.marketTitle,
      marketSlug: input.marketSlug,
      outcome: input.outcome,
      side: 'SELL',
      size: input.size,
      price: input.price,
      amount: input.size * input.price,
      token: input.token ?? 'USDC',
      step: 'submitting',
      status: 'processing',
      createdAt: Date.now()
    }
    setPendingOps((prev) => [...prev, op])
    return id
  }, [])

  const attachPurchaseId = useCallback((id: string, purchaseId: string) => {
    setPendingOps((prev) =>
      prev.map((op) => (op.id === id ? { ...op, purchaseId, step: 'order_placement' } : op))
    )
  }, [])

  const completeOp = useCallback(
    (id: string) => {
      setPendingOps((prev) =>
        prev.map((op) =>
          op.id === id ? { ...op, status: 'completed', step: 'done', resolvedAt: Date.now() } : op
        )
      )
      revalidateAfterTrade()
    },
    [revalidateAfterTrade]
  )

  const failOp = useCallback((id: string, error?: string) => {
    setPendingOps((prev) =>
      prev.map((op) =>
        op.id === id ? { ...op, status: 'failed', error, resolvedAt: Date.now() } : op
      )
    )
  }, [])

  const addClaim = useCallback((amount: number, token = 'USDC'): string => {
    const id = genId()
    const op: PendingOp = {
      id,
      kind: 'claim',
      marketTitle: '',
      amount,
      token,
      step: 'bridge',
      status: 'processing',
      createdAt: Date.now()
    }
    setPendingOps((prev) => [...prev, op])
    return id
  }, [])

  // ----------------------------------------------------------------------
  // Polling loop — owned by the provider so it survives drawer close / nav.
  // ----------------------------------------------------------------------
  const tickInFlight = useRef(false)

  useEffect(() => {
    if (!wallet) return undefined

    const tick = async () => {
      if (tickInFlight.current) return
      const now = Date.now()
      const ops = opsRef.current

      // Garbage-collect resolved ops after the grace window, plus any op that has
      // been "processing" far longer than it ever should (stuck/orphaned).
      const expired = ops.filter(
        (op) =>
          (op.status !== 'processing' && op.resolvedAt && now - op.resolvedAt > KEEP_RESOLVED_MS) ||
          (op.status === 'processing' && now - op.createdAt > STALE_PROCESSING_MS)
      )
      if (expired.length) {
        const expiredIds = new Set(expired.map((o) => o.id))
        setPendingOps((prev) => prev.filter((op) => !expiredIds.has(op.id)))
      }

      // Optimistically resolve claims (no backend status endpoint).
      const claimToResolve = ops.filter(
        (op) =>
          op.kind === 'claim' && op.status === 'processing' && now - op.createdAt > CLAIM_RESOLVE_MS
      )
      if (claimToResolve.length) {
        const ids = new Set(claimToResolve.map((o) => o.id))
        setPendingOps((prev) =>
          prev.map((op) =>
            ids.has(op.id) ? { ...op, status: 'completed', step: 'done', resolvedAt: now } : op
          )
        )
        revalidateAfterTrade()
      }

      // Poll purchase status for sells/buys with a real id.
      const pollable = ops.filter(
        (op) => op.status === 'processing' && !!op.purchaseId && op.kind !== 'claim'
      )
      if (!pollable.length) return

      tickInFlight.current = true
      try {
        let anyCompleted = false
        await Promise.all(
          pollable.map(async (op) => {
            try {
              const res = await polymarketPurchaseStatus(op.purchaseId!)
              if (!res.ok) {
                // 404 / backend error during poll — the operation most likely
                // settled without a status record, so resolve it instead of
                // polling forever (matches the rest of the codebase's behaviour).
                anyCompleted = true
                updateOp(op.id, { status: 'completed', step: 'done', resolvedAt: Date.now() })
                return
              }
              if (!res.data) return
              const st = res.data.status
              const step = res.data.current_step || op.step
              if (st === 'completed') {
                anyCompleted = true
                updateOp(op.id, { status: 'completed', step: 'done', resolvedAt: Date.now() })
              } else if (st === 'failed') {
                updateOp(op.id, {
                  status: 'failed',
                  step,
                  error: res.data.error,
                  resolvedAt: Date.now()
                })
              } else {
                updateOp(op.id, { step })
              }
            } catch {
              /* transient — retry next tick */
            }
          })
        )
        if (anyCompleted) revalidateAfterTrade()
      } finally {
        tickInFlight.current = false
      }
    }

    // Run once immediately, then on an interval.
    tick()
    const interval = setInterval(tick, POLL_MS)
    return () => clearInterval(interval)
  }, [wallet, updateOp, revalidateAfterTrade])

  const sellingPosKeys = useMemo(() => {
    const set = new Set<string>()
    for (const op of pendingOps) {
      if (op.status === 'processing' && op.posKey) set.add(op.posKey)
    }
    return set
  }, [pendingOps])

  const value = useMemo<ActivityContextValue>(
    () => ({
      pendingOps,
      sellingPosKeys,
      startSell,
      attachPurchaseId,
      completeOp,
      failOp,
      addClaim,
      removeOp
    }),
    [
      pendingOps,
      sellingPosKeys,
      startSell,
      attachPurchaseId,
      completeOp,
      failOp,
      addClaim,
      removeOp
    ]
  )

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

// ----------------------------------------------------------------------

export function usePolymarketActivity(): ActivityContextValue {
  const ctx = useContext(ActivityContext)
  if (!ctx) {
    throw new Error('usePolymarketActivity must be used within a PolymarketActivityProvider')
  }
  return ctx
}
