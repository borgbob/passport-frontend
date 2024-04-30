import { Chain as ViemChain, avalanche, avalancheFuji, hardhat } from 'viem/chains';
const supportedChains = [
  avalanche,
  avalancheFuji
] as ViemChain[]

const prodChains = supportedChains as [ViemChain, ...ViemChain[]]

const devChains = ([
  // hardhat,
] as ViemChain[]).concat(supportedChains) as [ViemChain, ...ViemChain[]]

export const chains = process.env.NODE_ENV === 'production' ? prodChains : devChains
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
