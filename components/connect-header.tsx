import { FC, useCallback, useEffect, useState } from 'react'
import type { Address, Chain } from 'viem'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ConnectKitButton } from 'connectkit';
import { useDisconnect } from 'wagmi';

type LoginLogoutButtonProps = {
  isConnected: boolean
  isConnecting: boolean
  showConnectModal: () => void
  signedIn: boolean
  csrfToken: string | undefined
  address: Address | undefined
  chain: Chain | undefined
  onSignIn: (address: Address, chain: Chain, csrfToken: string) => void
  onSignOut: () => void
}

export type ConnectHeaderProps = {
  signedIn: boolean
  csrfToken: string | undefined
  onSignIn: (address: Address, chain: Chain, csrfToken: string) => void
  onSignOut: () => void
}

const LoginLogoutButton: FC<LoginLogoutButtonProps> = ({
  address,
  chain,
  isConnected,
  isConnecting,
  showConnectModal,
  signedIn,
  csrfToken,
  onSignIn,
  onSignOut
}) => {
  const { disconnect } = useDisconnect()
  const [signingIn, setSigningIn] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // The following two callbacks can be safely memoized with warning silenced.
  // Not doing so will cause infinite re-rendering loops.
  // This is actually a bug in ConnectKitButton.Custom
  const onSignInMemoized = useCallback(() => {
    if (address && chain && csrfToken) {
      onSignIn(address!, chain!, csrfToken!)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain, csrfToken])
  const showConnectModalMemoized = useCallback(() => {
    showConnectModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain])

  useEffect(() => {
    if (!signingIn || isConnecting) {
      return
    }

    if (!isConnected) {
      showConnectModalMemoized()
      return
    }

    setSigningIn(false)
    onSignInMemoized()
  }, [
    signingIn,
    isConnected,
    isConnecting,
    onSignInMemoized,
    showConnectModalMemoized
  ])

  useEffect(() => {
    if (!signingOut) {
      return
    }

    if (signedIn) {
      onSignOut()
      return
    }

    if (isConnected) {
      disconnect()
      return
    }

    setSigningOut(false)
    // Might be a bug in wagmi, but reloading seems necessary to refresh the wallet
    // disconnected state. If we don't do this, trying to connect again will show an error
    window.location.reload()
  }, [signingOut, signedIn, isConnected, disconnect, onSignOut])

  function onClick() {
    if (signedIn) {
      setSigningOut(true)
    } else {
      setSigningIn(true)
    }
  }

  return (
    <Button disabled={isConnecting || signingIn || signingOut} variant="passport" className="pl-20 pr-20" type="button" onClick={onClick}>
      {signedIn ? 'Logout' : 'Login'}
    </Button>
  )
}

export const ConnectHeader: FC<ConnectHeaderProps> = ({
  csrfToken,
  signedIn,
  onSignIn,
  onSignOut
}) => {
  return (
    <div className="flex flex-row justify-between items-center mb-5">
      <div className="flex flex-row">
        <Image src={`/logo.png`} alt={`Header`} width={50} height={50} />
        <div className="flex flex-col">
          <span className="font-bold text-xl uppercase">Peaks</span>
          <span className="text-xs uppercase">Avax Passport</span>
        </div>
      </div>
      <div>
        <ConnectKitButton.Custom>
          {({ isConnected, isConnecting, show, address, chain }) => {
            return (
              <LoginLogoutButton
                csrfToken={csrfToken}
                isConnected={isConnected}
                isConnecting={isConnecting}
                showConnectModal={show ?? (() => undefined)}
                signedIn={signedIn}
                address={address}
                chain={chain}
                onSignIn={onSignIn}
                onSignOut={onSignOut} />
            )
          }}
        </ConnectKitButton.Custom>
      </div>
    </div>
  )
}
