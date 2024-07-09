import { useAuth, type Auth } from "@/hooks/useAuth";
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image'
import { SiweMessage } from "siwe";
import { ConnectKitButton } from 'connectkit';
import { EIP712Proxy } from "@ethereum-attestation-service/eas-sdk/dist/eip712-proxy";
import type { Address, Chain } from 'viem'
import { useAccount, useSignMessage } from "wagmi"
import { Button } from "@/components/ui/button"
import { jsonParseBigInt } from "@/lib/utils"

import { PROXY_CONTRACT_ADDRESS } from "@/lib/config"

import { isDiamondHands } from "@/lib/diamond-hands"
import { useSigner } from "@/hooks/useSigner";
import { useEffect, useState } from "react";
import { useIsAttested } from "@/hooks/useIsAttested";
import { ethers } from 'ethers';
import { getProxy } from '@/lib/proxy';

interface SignedOutProps {
  csrfToken: Auth['csrfToken']
  signIn: Auth['signIn']
  address?: Address
  chain?: Chain
  signMessageAsync: ReturnType<typeof useSignMessage>['signMessageAsync']
}

function SignedOut({ csrfToken, signIn, address, chain, signMessageAsync }: SignedOutProps) {
  async function handleSignIn() {
    if (!csrfToken || !address) {
      return;
    }

    const message = new SiweMessage({
      domain: window.location.host,
      address: address,
      statement: "Sign in with Ethereum",
      uri: window.location.origin,
      version: "1",
      chainId: chain?.id,
      nonce: csrfToken,
    })

    const signature = await signMessageAsync({
      message: message.prepareMessage()
    })

    signIn({ message: JSON.stringify(message), signature })
  }

  return (
    <Button type="button" onClick={() => {
      handleSignIn()
    }}>Login</Button>
  )
}

interface SignedInProps {
  session: NonNullable<Auth['session']>
  csrfToken: Auth['csrfToken']
  signOut: Auth['signOut']
}

function SignedIn({ session, signOut, csrfToken }: SignedInProps) {
  const githubLinked = session.user?.linkedAccounts?.['github']
  const twitterLinked = session.user?.linkedAccounts?.['twitter']
  const diamondHands = isDiamondHands(session.user?.sub)
  const signer = useSigner()
  const [proxy, setProxy] = useState<ethers.Contract| null>(null)
  const isAttested = useIsAttested(session.user?.sub)

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
        console.error('not connected!')
        return
      }
      const tx = await proxy.attestByDelegation(
        'diamond-hand', {
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
      console.log(tx);
      await tx.wait();
    }
  })

  const socialConnections = [{
    name: 'github',
    linked: githubLinked,
    connectUrl: '/api/auth/signin/github',
    description: 'Link Github account',
    connectedDescription: `Connected as "${githubLinked}"`,
    buttonLabel: 'Connect'
  }, {
    name: 'twitter',
    linked: twitterLinked,
    connectUrl: '/api/auth/signin/twitter',
    description: 'Link Twitter/X account',
    connectedDescription: `Connected as "${twitterLinked}"`,
    buttonLabel: 'Connect'
  },]

  let totalPoints = 0;
  for (const connection of socialConnections) {
    if (connection.linked) {
      totalPoints += 50;
    }
  }

  if (diamondHands) {
    totalPoints += 150;
  }

  return (
    <div className="flex flex-col items-center">
      <Button type="button" onClick={() => {
        signOut()
      }}>Logout</Button>

      <h1 className="text-2xl font-semibold mt-5">{session.user?.sub} (total points: {totalPoints})</h1>

      <div className="flex flex-wrap mt-10">

        {socialConnections.map(({ name, linked, connectUrl, description, connectedDescription, buttonLabel }) => (
          <div key={name} className="mr-10 mt-10 flex flex-col items-center justify-between bg-gray-100 border rounded-sm p-5 w-[300px] h-[200px]">
            <Image src={`/${name}.png`} alt={`${name} connection`} width={75} height={75} />
            {linked ? (
              <p>{connectedDescription}</p>) : (<>
                <p>{description}</p>
                <form action={connectUrl} method="post">
                  <input type="hidden" name="csrfToken" value={csrfToken} />
                  <input type="hidden" name="callbackUrl" value={window.location.origin} />
                  <Button type="submit">{buttonLabel}</Button>
                </form></>)}
          </div>
        ))}
        <div className="mr-10 mt-10 flex flex-col items-center justify-between bg-gray-100 border rounded-sm p-5 w-[300px] h-[200px]">
          <Image src={`/diamond.png`} alt={`Is diamond hands`} width={75} height={75} />
          {diamondHands ? (
            <><p>You have diamond hands!</p>
              {isAttested ? <p>Already attested</p> :
              <Button type="button" onClick={() => {
                attestMutation.mutate()
              }}>Attest</Button>}</>
          ) : (
            <p>You do not have diamond hands</p>)}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { signMessageAsync } = useSignMessage()
  const { session, csrfToken, signIn, signOut } = useAuth()
  const { address, chain, isConnected } = useAccount()

  return (
    <main className="flex flex-col items-center justify-between pt-5">

      {!isConnected ? (
        <div>
          <ConnectKitButton />
        </div>
      ) : session ?
        <SignedIn
          csrfToken={csrfToken}
          session={session}
          signOut={signOut}
        /> :
        <SignedOut
          csrfToken={csrfToken}
          signIn={signIn}
          address={address}
          chain={chain}
          signMessageAsync={signMessageAsync}
        />}
    </main>
  );
}
