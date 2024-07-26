import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isDiamondHands, attestedDiamondHands } from "@/lib/diamond-hands"
import { signDiamondHand } from '@/lib/signing/diamond-hand';

import {
  PROXY_CONTRACT_ADDRESS,
} from "@/lib/config"


if (!PROXY_CONTRACT_ADDRESS) {
  throw new Error('PROXY_CONTRACT_ADDRESS is not set')
}

export const runtime = "edge";

function getWalletAddress(session: any) {
  return session.user.sub
}

export async function POST(req: NextRequest) {
  const walletAddress = getWalletAddress(await auth())

  if (!walletAddress) {
    return NextResponse.json({ error: 'No wallet address found in session' }, { status: 400 })
  }

  if (!isDiamondHands(walletAddress)) {
    return NextResponse.json({ error: 'User is not diamond hands' }, { status: 400 })
  }

  if (await attestedDiamondHands(walletAddress)) {
    return NextResponse.json({ error: 'User has attestation' }, { status: 400 })
  }

  const signedResponse = await signDiamondHand(walletAddress);
  return NextResponse.json({ signedResponse })
}
