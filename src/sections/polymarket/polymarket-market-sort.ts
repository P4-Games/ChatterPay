import type { IPolymarketMarket } from 'src/types/polymarket'

function getYesPrice(market: IPolymarketMarket): number {
  return Number(market.outcome_prices?.[0] || 0)
}

/** A closed market's Yes price settles near 1 (Yes won) or 0 (No won). */
export function isMarketResolvedYes(market: IPolymarketMarket): boolean {
  return getYesPrice(market) >= 0.5
}

/**
 * Ranks an event's market options the way traders scan them: most likely
 * to happen first. Closed markets sink to the bottom, resolved-Yes ahead
 * of resolved-No; ties break on volume.
 */
export function sortMarketOptions(markets: IPolymarketMarket[]): IPolymarketMarket[] {
  return [...markets].sort((a, b) => {
    if (a.closed !== b.closed) return a.closed ? 1 : -1

    if (a.closed) {
      const aResolvedYes = isMarketResolvedYes(a)
      const bResolvedYes = isMarketResolvedYes(b)
      if (aResolvedYes !== bResolvedYes) return aResolvedYes ? -1 : 1
    }

    const yesDiff = getYesPrice(b) - getYesPrice(a)
    if (yesDiff !== 0) return yesDiff

    return (b.volume || 0) - (a.volume || 0)
  })
}
