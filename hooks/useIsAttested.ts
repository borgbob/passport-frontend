import type { Address, PublicClient } from 'viem'
import { usePublicClient } from 'wagmi'

import { PROXY_CONTRACT_ADDRESS } from "@/lib/config"
import { useEffect, useState } from 'react';
import proxyABI from '@/lib/proxy-abi.json';


async function check(client: PublicClient, address: Address, attestationType: string) {
  const attestationCount = await client.readContract({
    address: PROXY_CONTRACT_ADDRESS,
    abi: proxyABI,
    functionName: 'userAuthenticationCount',
    args: [address, attestationType],
  })
  if (!attestationCount) {
    return false;
  }
  return true;
}

export function useIsAttested(address: Address, attestationType: string) {
  const client = usePublicClient();
  const [isAttested, setIsAttested] = useState(false);

  useEffect(() => {
    if (!client) {
      return;
    }

    const promise = check(client, address, attestationType);

    promise.then((isAttested) => {
      setIsAttested(isAttested);
    }).catch(console.error)

  }, [client, address])

  return isAttested;
}
