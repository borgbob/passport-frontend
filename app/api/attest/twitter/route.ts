import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isTwitterAuthenticated, attestedTwitter } from "@/lib/twitter"
import { signTwitter } from '@/lib/signing/twitter';
import {
  PROXY_CONTRACT_ADDRESS,
  PRIVATE_KEY,
} from "@/lib/config"


if (!PROXY_CONTRACT_ADDRESS) {
  throw new Error('PROXY_CONTRACT_ADDRESS is not set')
}

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not set')
}

export const runtime = "edge";

function getWalletAddress(session: any) {
  return session.user.sub
}

export async function POST(req: NextRequest) {
  const walletAddress = getWalletAddress(await auth())
  const session = await auth();
  if (session === undefined || session === null) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 400 })
  }
  if (!walletAddress) {
    return NextResponse.json({ error: 'No wallet address found in session' }, { status: 400 })
  }

  if (!isTwitterAuthenticated(session)) {
    return NextResponse.json({ error: 'User has not authenticated twitter' }, { status: 400 })
  }

  if (await attestedTwitter(walletAddress)) {
    return NextResponse.json({ error: 'User has attestation' }, { status: 400 })
  }
  const signedResponse = await signTwitter(session.user?.linkedAccounts?.twitter, walletAddress);
  return NextResponse.json({ signedResponse })
}
