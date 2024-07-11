import type { Address, PublicClient } from 'viem'
import { usePublicClient } from 'wagmi'

import { PROXY_CONTRACT_ADDRESS } from "@/lib/config"
import { useEffect, useState } from 'react';

const abi = [
  {
    type: "function",
    name: "userAuthenticationCount",
    inputs: [
      { name: "user", type: "address", internalType: "address" },
      { name: "id", type: "string", internalType: "string" }
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
      { name: "id", type: "string", internalType: "string" },
      { name: "idx", type: "uint256", internalType: "uint256" }
    ],
    outputs: [
      { name: "", type: "bytes32", internalType: "bytes32" }
    ],
    stateMutability: "view"
  }
] as const

async function check(client: PublicClient, address: Address) {
  const attestationCount = await client.readContract({
    address: PROXY_CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'userAuthenticationCount',
    args: [address, 'diamond-hand'],
  })

  if (!attestationCount) {
    return false;
  }

  const attestationIds = [];
  for (let i = 0; i < attestationCount; i++) {
    const attestationId = await client.readContract({
      address: PROXY_CONTRACT_ADDRESS,
      abi: abi,
      functionName: 'userAuthentication',
      args: [address, 'diamond-hand', BigInt(i)],
    });
    attestationIds.push(attestationId);
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
