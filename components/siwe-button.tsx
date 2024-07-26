import { useEffect } from 'react';
import { Button } from "@/components/ui/button"

interface SiweButtonProps {
  isConnected: boolean
  isConnecting: boolean
  show: () => void
  signedIn: boolean
  onSignIn: () => void
  onSignOut: () => void
}

export const SiweButton = ({
  isConnected,
  isConnecting,
  show,
  signedIn,
  onSignIn,
  onSignOut
}: SiweButtonProps) => {

  useEffect(() => {
    if (isConnected) {
      onSignIn()
    }
  }, [isConnected, onSignIn])

  function signIn() {
    if (isConnecting) {
      return
    }

    if (!isConnected) {
      show()
      return;
    }
  }

  function signOut() {
    onSignOut()
  }

  return (
    <Button onClick={signedIn ? signOut : signIn} variant="passport">
      {signedIn ? "Sign Out" : "Sign In"}
    </Button>
  );
};
