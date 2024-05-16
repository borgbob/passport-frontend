import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Chain as ViemChain, avalanche, avalancheFuji, hardhat } from 'viem/chains';
const supportedChains = [
  avalanche,
  avalancheFuji
] as ViemChain[]

const prodChains = supportedChains as [ViemChain, ...ViemChain[]]

const devChains = ([
  hardhat,
] as ViemChain[]).concat(supportedChains) as [ViemChain, ...ViemChain[]]

export const chains = process.env.NODE_ENV === 'production' ? prodChains : devChains
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const PROXY_CONTRACT_ADDRESS = process.env.PROXY_CONTRACT_ADDRESS!;
export const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// This is actually the GM schema. If schema UIDs are deterministic, then we can probably hardcode the diamond hands schema uid here.
export const DIAMOND_HANDS_SCHEMA_UID = '0x85500e806cf1e74844d51a20a6d893fe1ed6f6b0738b50e43d774827d08eca61'

// make things more efficient by encoding attestation data here once

const encoder = new SchemaEncoder('bool gm')
export const DIAMOND_HANDS_ATTESTATION_DATA = encoder.encodeData([{
  name: 'gm',
  type: 'bool',
  value: true
}])
