import type { Address } from 'viem'

import prodDiamondHands from './diamond-hands-data.json'
const devDiamondHands: Address[] = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',  // hardhat dev first wallet address
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
]

const diamondHands = new Set(process.env.NODE_ENV === 'production' ? prodDiamondHands : devDiamondHands)

export function isDiamondHands(address: Address) {
  console.log('Diamond hands count', diamondHands.size)
  console.log('Checking if ', address, ' is diamond hands')
  const result = diamondHands.has(address)
  console.log('Result: ', result)
  return result
}
