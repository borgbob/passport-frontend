import { FC, PropsWithChildren } from 'react'
import Image from 'next/image'

import { Button } from "@/components/ui/button"
import { AttestCard } from "@/components/attest-card"

export type AttestCardSocialConnectionProps = {
  name: string
  description: string
  connectedDescription: string
  buttonLabel: string
  connectUrl: string
  linked: string
  csrfToken: string
  isAttested: boolean
  attest?: () => void
}

export const AttestCardSocialConnection: FC<AttestCardSocialConnectionProps> = ({
  name,
  description,
  connectedDescription,
  linked,
  connectUrl,
  buttonLabel,
  csrfToken,
  isAttested,
  attest
}) => {
  const callbackUrl = (() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.origin
  })()

  return (
    <AttestCard name={name}>
      {linked ? (
        <>
          <p>{connectedDescription}</p>
          {isAttested ? <p>Already attested</p> :
            attest && (<Button variant="passport" type="button" onClick={attest}>Attest</Button>)}
        </>
      ) : (<>
        <p>{description}</p>
        <form action={connectUrl} method="post">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <Button variant="passport" type="submit">{buttonLabel}</Button>
        </form></>)}
    </AttestCard>
  )
}
