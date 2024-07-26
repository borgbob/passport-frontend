import type { Address } from 'viem'
import { getProxy } from "@/lib/proxy";
import { JsonRpcProvider } from "ethers";
import { JSON_RPC_ENDPOINT } from "@/lib/config"


import prodDiamondHands from './diamond-hands-data.json'
const devDiamondHands: Address[] = [
  '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',  // hardhat dev first wallet address
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
]

const diamondHands = new Set(process.env.NODE_ENV === 'production' ? prodDiamondHands : devDiamondHands)

export function isDiamondHands(address?: Address) {
  if (!address) {
    return false
  }
  return diamondHands.has(address.toLowerCase())
}

export async function attestedDiamondHands(address: Address) {
  const provider = new JsonRpcProvider(JSON_RPC_ENDPOINT)
  const proxy = getProxy(provider);
  return (await proxy.userAuthenticationCount(address, 'diamond-hand')) >= 1;
}
