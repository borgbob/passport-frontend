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

export const ATTESTATION_CONFIG = {
    'diamond-hand': {
        schemaUID: '0xdb510b1ec6287bc9d4560ea47175ec0c3aabb083de43100f6308ad29dd1c1350',
        encoder: new SchemaEncoder('bool hasDiamondHand'),
    },
    'twitter': {
       schemaUID: '0x5dd1160c15fcc616c4c9f77e8bacff98d31f9519d7d1b94c03a970be787ae011',
       encoder: new SchemaEncoder('string twitterId'),
    },
    'github': {
        schemaUID: '0x6723811a6182bcb2fde3035b69a8e3bb854f1ff76413b71d5673ed653208d7ac',
        encoder: new SchemaEncoder('string githubId'),
    }
};
