import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { SiweMessage } from "siwe";
import type { Address, Chain } from 'viem'
import { useSignMessage } from "wagmi"

interface Credentials {
  message: string
  signature: string
}

export type Auth = ReturnType<typeof useAuth>

export function useAuth() {
  const queryClient = useQueryClient();
  const { signMessageAsync } = useSignMessage()

  function invalidateSession() {
    queryClient.invalidateQueries({
      queryKey: ['session']
    })
  }

  const csrfTokenQuery = useQuery({
    queryKey: ['csrf'],
    queryFn: async () => {
      const res = await fetch(`/api/auth/csrf`)
      const data = await res.json()
      return data.csrfToken
    },
  })

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch(`/api/auth/session`)
      return res.json()
    },
  })

  const { mutateAsync: signIn } = useMutation({
    mutationKey: ['signIn', csrfTokenQuery.data],
    mutationFn: async (credentials: Credentials) => {
      const formData = new URLSearchParams()
      formData.set('message', credentials.message)
      formData.set('signature', credentials.signature)
      formData.set('csrfToken', csrfTokenQuery.data)
      await fetch(`/api/auth/callback/credentials`, {
        method: 'POST',
        body: formData
      })
      return undefined
    },
    onSuccess: invalidateSession
  });

  const { mutateAsync: signOut } = useMutation({
    mutationKey: ['signOut', csrfTokenQuery.data],
    mutationFn: async () => {
      const formData = new URLSearchParams()
      formData.set('csrfToken', csrfTokenQuery.data)
      await fetch(`/api/auth/signout`, {
        method: 'POST',
        body: formData
      })
    },
    onSuccess: invalidateSession
  });

  async function handleSignIn(address: Address, chain: Chain, csrfToken: string) {
    if (!csrfToken) {
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

  return {
    session: sessionQuery.data,
    signIn: handleSignIn,
    signOut,
    csrfToken: csrfTokenQuery.data
  }
}
