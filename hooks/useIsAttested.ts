import type { Address, PublicClient } from 'viem'
import { usePublicClient } from 'wagmi'

import {
  PROXY_CONTRACT_ADDRESS,
  DIAMOND_HANDS_SCHEMA_UID,
} from "@/lib/config"
import { useEffect, useState } from 'react';

const abi = [
  {
    type: "function",
    name: "userAuthenticationCount",
    inputs: [
      { name: "user", type: "address", internalType: "address" },
      { name: "schema", type: "bytes32", internalType: "bytes32" }
    ],
    outputs: [
      { name: "", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "userAuthentication",
    inputs: [
      { name: "user", type: "address", internalType: "address" },
      { name: "schema", type: "bytes32", internalType: "bytes32" },
      { name: "idx", type: "uint256", internalType: "uint256" }
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PassportEIP712Proxy.AttestationRecord",
        components: [
          { name: "attestationId", type: "bytes32", internalType: "bytes32" },
          { name: "isRevoked", type: "bool", internalType: "bool" }
        ]
      }],
    stateMutability: "view"
  }
] as const

async function check(client: PublicClient, address: Address) {
  const attestationCount = await client.readContract({
    address: PROXY_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'userAuthenticationCount',
    args: [address, DIAMOND_HANDS_SCHEMA_UID],
  })

  if (!attestationCount) {
    return false;
  }

  const attestationIds = [];
  for (let i = 0; i < attestationCount; i++) {
    const { attestationId, isRevoked } = await client.readContract({
      address: PROXY_CONTRACT_ADDRESS,
      abi: abi,
      functionName: 'userAuthentication',
      args: [address, DIAMOND_HANDS_SCHEMA_UID, BigInt(i)],
    });
    if (!isRevoked) {
      attestationIds.push(attestationId);
    }
  }
  return true;
}

export function useIsAttested(address: Address) {
  const client = usePublicClient();
  const [isAttested, setIsAttested] = useState(false);

  useEffect(() => {
    if (!client) {
      return;
    }

    const promise = check(client, address);

    promise.then((isAttested) => {
      setIsAttested(isAttested);
    }).catch(console.error)

  }, [client, address])

  return isAttested;
}
