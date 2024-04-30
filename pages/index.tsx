import { useAuth } from "@/hooks/useAuth";
import { SiweMessage } from "siwe";
import { ConnectKitButton } from 'connectkit';
import { useAccount, useSignMessage } from "wagmi"

export default function Home() {
  const { signMessageAsync } = useSignMessage()
  const { session, signIn, signOut, csrfToken } = useAuth()
  const { address, isConnected, chain } = useAccount()

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

  const githubLinked = session?.user?.linkedAccounts?.['github']
  const twitterLinked = session?.user?.linkedAccounts?.['twitter']

  return (
    <main className="flex flex-col min-h-screen items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <section>
          {session ? (<>
            <pre>Session: {JSON.stringify(session, null, 2)}</pre>
          </>) : null}
        </section>
        <div className="flex flex-col">
          {session ? (<>
            <button type="button" onClick={() => {
              signOut()
            }}>Logout</button>
            {!githubLinked ?
              <form action="/api/auth/signin/github" method="post">
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="callbackUrl" value={window.location.origin} />
                <button type="submit" className="mt-10">Connect github</button>
              </form>
              : null}
            {!twitterLinked ?
              <form action="/api/auth/signin/twitter" method="post">
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="callbackUrl" value={window.location.origin} />
                <button type="submit" className="mt-10">Connect twitter</button>
              </form>
              : null}
          </>) : (
            <button type="button" onClick={() => {
              handleSignIn()
            }}>Login</button>
          )}
        </div>
      </div>
      <ConnectKitButton />
    </main>
  );
}
