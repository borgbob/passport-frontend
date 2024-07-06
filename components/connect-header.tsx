import { FC, useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"

export type ConnectHeaderProps = {
  isConnected: boolean
  isConnecting: boolean
  showConnectModal: () => void
  signedIn: boolean
  disconnectWallet: () => void
  onSignIn: () => void
  onSignOut: () => void
}

export const ConnectHeader: FC<ConnectHeaderProps> = ({
  isConnected,
  isConnecting,
  showConnectModal,
  disconnectWallet,
  signedIn,
  onSignIn,
  onSignOut
}) => {
  debugger
  const [signingIn, setSigningIn] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    debugger
    if (isConnected) {
      setSigningIn(true)
    } else {
      setSigningOut(true)
    }
  }, [isConnected, onSignOut])

  useEffect(() => {
    if (signingIn) {
      debugger
      setSigningIn(false)
      onSignIn()
    }
  }, [signingIn])

  useEffect(() => {
    if (signingOut) {
      setSigningOut(false)
      onSignOut()
    }
  }, [signingOut])

  const signIn = useCallback(() => {
    if (isConnecting) {
      return
    }

    if (!isConnected) {
      showConnectModal()
      return
    }
    setSigningIn(true)

  }, [isConnected, isConnecting])

  const signOut = useCallback(() => {
    disconnectWallet()
  }, [disconnectWallet])

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
        {signedIn && (
          <Button variant="passport" className="pl-20 pr-20" type="button" onClick={signOut}>
            Logout
          </Button>
        ) || (
          <Button disabled={isConnecting} variant="passport" className="pl-20 pr-20" type="button" onClick={signIn}>
            Login
          </Button>
        )}
      </div>
    </div>
  )
}
