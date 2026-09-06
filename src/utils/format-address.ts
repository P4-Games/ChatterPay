/**
 * Mask the address keeping its prefix and last 4 characters
 * @param address
 * @returns
 */
export function maskAddress(address: string): string {
  const prefixLength = address.startsWith('addr') ? 10 : 4
  return `${address.slice(0, prefixLength)}****${address.slice(-4)}`
}
