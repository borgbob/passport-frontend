import { type Auth } from "@/hooks/useAuth";
import type { Address } from 'viem'
import { getProxy } from "@/lib/proxy";
import { JsonRpcProvider } from "ethers";


export function isTwitterAuthenticated(session: Auth['session']) {
  return session.user?.linkedAccounts['twitter'];
}

export async function attestedTwitter(address: Address) {
  const provider = new JsonRpcProvider(process.env.RPC_PROVIDER)
  const proxy = getProxy(provider);
  return (await proxy.userAuthenticationCount(address, 'twitter')) >= 1;
}
