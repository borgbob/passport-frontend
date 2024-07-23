import { useMutation } from '@tanstack/react-query';
import { jsonParseBigInt } from "@/lib/utils"
import { ethers, Typed } from 'ethers';
import { useSigner } from "@/hooks/useSigner";
import { getProxy } from '@/lib/proxy';

import { useEffect, useState } from 'react';


export function useAttest(kind: string) {
  // TODO(jumbo) use "kind" to determine the attestation type
  const [proxy, setProxy] = useState<ethers.Contract| null>(null)
  const signer = useSigner()

  useEffect(() => {
    if (signer) {
      setProxy(getProxy(signer));
    }
  }, [signer])

  const attestMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/attest', {
        method: 'POST'
      })
      const data = await res.json()
      const response = jsonParseBigInt(data.signedResponse)
      if (!proxy) {
        // TODO use toast or something similar to report an error, though I think we should never reach this point
        return
      }
      try {
        const tx = await proxy.attestByDelegation(
          Typed.string('diamond-hand'), {
          schema: response.message.schema,
          data: {
            recipient: response.message.recipient,
            data: response.message.data,
            revocable: response.message.revocable,
            expirationTime: 0,
            refUID: ethers.ZeroHash,
            value: 0,
          },
          attester: response.message.attester,
          signature: response.signature,
          deadline: response.message.deadline,
        })
        await tx.wait();
      } catch (err) {
        // This shouldn't happen but ethers doesn't seem to like
        // function overloading.
        console.error(err)
      }
    }
  })

  function attest() {
    attestMutation.mutate()
  }

  return {
    attest
  }
}
