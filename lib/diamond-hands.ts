import type { Address } from 'viem'

const diamondHands: Address[] = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
]


export function isDiamondHands(address: Address) {
  return diamondHands.includes(address)
}
