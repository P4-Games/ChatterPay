'use client'

import axios from 'axios'
import useSWR from 'swr'
import { useState, useEffect } from 'react'

import { POLYMARKET_WS_URL } from 'src/config-global'

// ----------------------------------------------------------------------
// Live market prices for Polymarket. REST history seed goes through a
// server-side proxy; the websocket connects the browser directly.
// ----------------------------------------------------------------------

const CLOB_WS_URL = POLYMARKET_WS_URL

// Polymarket closes idle sockets (~10s without traffic)
const PING_INTERVAL_MS = 10_000
const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 15_000
// Ticks closer together than this update the last chart point instead of appending
const LIVE_POINT_MIN_GAP_MS = 15_000
const MAX_LIVE_POINTS = 500

/** A single price sample: `t` unix seconds, `p` price in 0..1. */
export type IPolymarketPricePoint = { t: number; p: number }

/** Time ranges accepted by the CLOB `prices-history` endpoint. */
export type PolymarketChartRange = '1h' | '6h' | '1d' | '1w' | '1m' | 'max'

// Sample resolution (minutes) per range
const RANGE_FIDELITY: Record<PolymarketChartRange, number> = {
  '1h': 1,
  '6h': 5,
  '1d': 15,
  '1w': 60,
  '1m': 180,
  max: 720
}

// ----------------------------------------------------------------------
// REST: price history
// ----------------------------------------------------------------------

type HistoryByToken = Record<string, IPolymarketPricePoint[]>

async function fetchPriceHistory(
  tokenIds: string[],
  range: PolymarketChartRange
): Promise<HistoryByToken> {
  const entries = await Promise.all(
    tokenIds.map(async (tokenId) => {
      try {
        const { data } = await axios.get<{ history?: IPolymarketPricePoint[] }>(
          '/api/v1/proxy/polymarket/prices-history',
          { params: { market: tokenId, interval: range, fidelity: RANGE_FIDELITY[range] } }
        )
        return [tokenId, Array.isArray(data?.history) ? data.history : []] as const
      } catch {
        return [tokenId, []] as const
      }
    })
  )
  return Object.fromEntries(entries)
}

/**
 * Fetches real price history for the given CLOB token ids at the given range.
 * @returns {object} `history` keyed by token id and `historyLoading`.
 */
export function usePolymarketPriceHistory(tokenIds: string[], range: PolymarketChartRange) {
  const idsKey = tokenIds.filter(Boolean).join(',')
  const { data, isLoading } = useSWR(
    idsKey ? ['polymarket-prices-history', idsKey, range] : null,
    () => fetchPriceHistory(idsKey.split(','), range),
    { revalidateOnFocus: false, keepPreviousData: true }
  )
  return { history: data ?? ({} as HistoryByToken), historyLoading: isLoading }
}

// ----------------------------------------------------------------------
// Websocket: live prices
// ----------------------------------------------------------------------

type BookLevel = { price: string; size: string }

type ClobMarketEvent = {
  event_type?: string
  asset_id?: string
  price?: string
  bids?: BookLevel[]
  asks?: BookLevel[]
  best_bid?: string
  best_ask?: string
  price_changes?: { asset_id?: string; best_bid?: string; best_ask?: string }[]
}

function midFromBook(bids: BookLevel[] | undefined, asks: BookLevel[] | undefined): number | null {
  if (!bids?.length || !asks?.length) return null
  const bestBid = Math.max(...bids.map((l) => Number(l.price)))
  const bestAsk = Math.min(...asks.map((l) => Number(l.price)))
  if (!Number.isFinite(bestBid) || !Number.isFinite(bestAsk)) return null
  return (bestBid + bestAsk) / 2
}

function midFromQuotes(bid?: string, ask?: string): number | null {
  const b = Number(bid)
  const a = Number(ask)
  if (!bid || !ask || !Number.isFinite(b) || !Number.isFinite(a)) return null
  return (b + a) / 2
}

/**
 * Streams live prices for the given CLOB token ids over Polymarket's public
 * market websocket. Prefers the orderbook midpoint (what Polymarket displays);
 * falls back to last trade price until a book snapshot arrives.
 * @returns {object} `livePrices` (token id → 0..1), `livePoints` (token id →
 * chart-ready samples since mount) and `liveConnected`.
 */
export function usePolymarketLivePrices(tokenIds: string[]) {
  const idsKey = tokenIds.filter(Boolean).join(',')

  const [connected, setConnected] = useState(false)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const [livePoints, setLivePoints] = useState<Record<string, IPolymarketPricePoint[]>>({})

  useEffect(() => {
    setLivePrices({})
    setLivePoints({})
    if (!idsKey || typeof window === 'undefined') return undefined

    const ids = idsKey.split(',')
    // Assets with a midpoint price already — last_trade_price is only a bootstrap
    const hasMid = new Set<string>()
    let ws: WebSocket | null = null
    let pingTimer: number | null = null
    let reconnectTimer: number | null = null
    let attempts = 0
    let disposed = false

    const applyPrice = (assetId: string | undefined, price: number | null) => {
      if (!assetId || price === null || !Number.isFinite(price) || price <= 0 || price > 1) return
      const rounded = Math.round(price * 1000) / 1000
      setLivePrices((prev) => (prev[assetId] === rounded ? prev : { ...prev, [assetId]: rounded }))
      setLivePoints((prev) => {
        const list = prev[assetId] ?? []
        const last = list[list.length - 1]
        const now = Date.now()
        if (last && now - last.t * 1000 < LIVE_POINT_MIN_GAP_MS) {
          if (last.p === rounded) return prev
          return { ...prev, [assetId]: [...list.slice(0, -1), { t: last.t, p: rounded }] }
        }
        const next = [...list, { t: Math.floor(now / 1000), p: rounded }]
        return { ...prev, [assetId]: next.slice(-MAX_LIVE_POINTS) }
      })
    }

    const handleEvent = (evt: ClobMarketEvent) => {
      switch (evt.event_type) {
        case 'book': {
          const mid = midFromBook(evt.bids, evt.asks)
          if (mid !== null && evt.asset_id) hasMid.add(evt.asset_id)
          applyPrice(evt.asset_id, mid)
          break
        }
        case 'price_change': {
          if (Array.isArray(evt.price_changes)) {
            evt.price_changes.forEach((pc) => {
              const assetId = pc.asset_id ?? evt.asset_id
              const mid = midFromQuotes(pc.best_bid, pc.best_ask)
              if (mid !== null && assetId) hasMid.add(assetId)
              applyPrice(assetId, mid)
            })
          } else {
            const mid = midFromQuotes(evt.best_bid, evt.best_ask)
            if (mid !== null && evt.asset_id) hasMid.add(evt.asset_id)
            applyPrice(evt.asset_id, mid)
          }
          break
        }
        case 'last_trade_price': {
          if (evt.asset_id && !hasMid.has(evt.asset_id)) {
            applyPrice(evt.asset_id, Number(evt.price))
          }
          break
        }
        default:
          break
      }
    }

    const clearTimers = () => {
      if (pingTimer !== null) window.clearInterval(pingTimer)
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer)
      pingTimer = null
      reconnectTimer = null
    }

    const connect = () => {
      if (disposed) return
      ws = new WebSocket(CLOB_WS_URL)

      ws.onopen = () => {
        attempts = 0
        setConnected(true)
        ws?.send(JSON.stringify({ assets_ids: ids, type: 'market' }))
        pingTimer = window.setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) ws.send('PING')
        }, PING_INTERVAL_MS)
      }

      ws.onmessage = (msg: MessageEvent) => {
        if (typeof msg.data !== 'string' || msg.data === 'PONG') return
        let parsed: unknown
        try {
          parsed = JSON.parse(msg.data)
        } catch {
          return
        }
        const events = (Array.isArray(parsed) ? parsed : [parsed]) as ClobMarketEvent[]
        events.forEach(handleEvent)
      }

      ws.onclose = () => {
        setConnected(false)
        if (pingTimer !== null) window.clearInterval(pingTimer)
        pingTimer = null
        if (!disposed) {
          attempts += 1
          const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempts, RECONNECT_MAX_MS)
          reconnectTimer = window.setTimeout(connect, delay)
        }
      }

      ws.onerror = () => {
        ws?.close()
      }
    }

    connect()

    return () => {
      disposed = true
      clearTimers()
      ws?.close()
    }
  }, [idsKey])

  return { livePrices, livePoints, liveConnected: connected }
}
