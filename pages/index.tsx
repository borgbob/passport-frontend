import { useAuth, type Auth } from "@/hooks/useAuth";
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button"
import { AttestCard } from "@/components/attest-card"
import { AttestCardSocialConnection } from "@/components/attest-card-social-connection"
import { Header } from "@/components/header"
import { ConnectHeader } from "@/components/connect-header"
import { jsonParseBigInt } from "@/lib/utils"

import { isDiamondHands } from "@/lib/diamond-hands"
import { useSigner } from "@/hooks/useSigner";
import { useEffect, useState } from "react";
import { useIsAttested } from "@/hooks/useIsAttested";
import { ethers } from 'ethers';
import { getProxy } from '@/lib/proxy';

interface SignedInProps {
  session: Auth['session']
  csrfToken: Auth['csrfToken']
  signOut: Auth['signOut']
}

function Main({ session, csrfToken }: SignedInProps) {
  const userName = session?.user?.userName ?? 'Anonymous';
  const githubLinked = session?.user?.linkedAccounts?.['github']
  const twitterLinked = session?.user?.linkedAccounts?.['twitter']
  const diamondHands = session?.user?.sub && isDiamondHands(session.user?.sub)
  const signer = useSigner()
  const [proxy, setProxy] = useState<ethers.Contract | null>(null)
  const isAttested = useIsAttested(session?.user?.sub)

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
    <>
      <Header
        userName={userName}
        isConnected={true}
        walletAddress={session?.user?.sub}
        score={totalPoints} />
      <div className="flex flex-wrap justify-between items-center">

        {socialConnections.map((props) => (
          <AttestCardSocialConnection key={props.name} {...props} csrfToken={csrfToken} />
        ))}
        <AttestCard name="diamond">
          {diamondHands ? (
            <><p>You have diamond hands!</p>
              {isAttested ? <p>Already attested</p> :
                <Button variant="passport" type="button" onClick={() => {
                  attestMutation.mutate()
                }}>Attest</Button>}</>
          ) : (
            <p>You do not have diamond hands</p>)}
        </AttestCard>
      </div>
    </>
  )
}

export default function Home() {
  const { session, csrfToken, signIn, signOut } = useAuth()

  return (
    <main className="flex flex-col items-center justify-between pt-5">
      <div className="w-[1024px]">
        <ConnectHeader
          signedIn={!!session}
          csrfToken={csrfToken}
          onSignIn={signIn}
          onSignOut={signOut} />

        <Main
          csrfToken={csrfToken}
          session={session}
          signOut={signOut}
        />
      </div>
    </main>
  );
}
