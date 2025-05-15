/**
 * Mask the address with the first 5 and last 4 characters
 * @param address
 * @returns
 */
export function maskAddress(address: string): string {
    return `${address.slice(0, 4)}****${address.slice(-4)}`;
}