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
       schemaUID: '0x8516df6f958479d19cbd51204d069cc331b10f6b307a63042c6b24775340ec2a',
       encoder: new SchemaEncoder('uint256 twitterId'),
    },
    'github': {
        schemaUID: '0x6723811a6182bcb2fde3035b69a8e3bb854f1ff76413b71d5673ed653208d7ac',
        encoder: new SchemaEncoder('string githubId'),
    }
};
