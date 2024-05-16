import type { Address } from 'viem'

const devDiamondHands: Address[] = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',  // hardhat dev first wallet address
]

const prodDiamondHands: Address[] = [
]

const diamondHands = new Set(process.env.NODE_ENV === 'production' ? prodDiamondHands : devDiamondHands)

export function isDiamondHands(address: Address) {
  return diamondHands.has(address)
}
