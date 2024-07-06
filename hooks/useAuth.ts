import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'

interface Credentials {
  message: string
  signature: string
}

export type Auth = ReturnType<typeof useAuth>

export function useAuth() {
  const queryClient = useQueryClient();

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

  return {
    session: sessionQuery.data,
    signIn,
    signOut,
    csrfToken: csrfTokenQuery.data
  }
}
