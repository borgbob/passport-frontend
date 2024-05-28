import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { Address } from 'viem'
import { Chain as ViemChain, avalancheFuji, hardhat } from 'viem/chains';
const supportedChains = [
  // avalanche,
  avalancheFuji
] as ViemChain[]

const prodChains = supportedChains as [ViemChain, ...ViemChain[]]

const devChains = ([
  hardhat,
] as ViemChain[]).concat(supportedChains) as [ViemChain, ...ViemChain[]]

export const chains = process.env.NODE_ENV === 'production' ? prodChains : devChains
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const PROXY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS! as Address;
export const PRIVATE_KEY = process.env.PRIVATE_KEY!;

export const DIAMOND_HANDS_SCHEMA_UID = '0x2453f5ceb545822684adba2d870fb52eab550b31e5d4071ba084e0940c7f6d30'

// make things more efficient by encoding attestation data here once
const encoder = new SchemaEncoder('bool hasDiamondHand')
export const DIAMOND_HANDS_ATTESTATION_DATA = encoder.encodeData([{
  name: 'hasDiamondHand',
  type: 'bool',
  value: true
}])
