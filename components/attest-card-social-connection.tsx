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
  linked: boolean
  csrfToken: string
}

export const AttestCardSocialConnection: FC<AttestCardSocialConnectionProps> = ({
  name,
  description,
  connectedDescription,
  linked,
  connectUrl,
  buttonLabel,
  csrfToken
}) => {
  return (
    <AttestCard name={name}>
      {linked ? (
        <p>{connectedDescription}</p>) : (<>
          <p>{description}</p>
          <form action={connectUrl} method="post">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input type="hidden" name="callbackUrl" value={window.location.origin} />
            <Button variant="passport" type="submit">{buttonLabel}</Button>
          </form></>)}
    </AttestCard>
  )
}
