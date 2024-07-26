import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isDiamondHands, attestedDiamondHands } from "@/lib/diamond-hands"
import { signDiamondHand } from '@/lib/signing/diamond-hand';

import {
  PROXY_CONTRACT_ADDRESS,
} from "@/lib/config"
import { getRedisInstance } from "@/lib/redis";
import { Lock } from "@upstash/lock";
import { ATTESTATION_DEADLINE } from "@/lib/config";



if (!PROXY_CONTRACT_ADDRESS) {
  throw new Error('PROXY_CONTRACT_ADDRESS is not set')
}

export const runtime = "edge";

function getWalletAddress(session: any) {
  return session.user.sub
}

export async function POST(req: NextRequest) {
  const walletAddress = getWalletAddress(await auth())

  const redis = getRedisInstance();

  const key = `${walletAddress}-diamond-hand`;
  const current = await redis.get(key);
  if (current) {
    return NextResponse.json(current);
  }

  if (!walletAddress) {
    return NextResponse.json({ error: 'No wallet address found in session' }, { status: 400 })
  }

  if (!isDiamondHands(walletAddress)) {
    return NextResponse.json({ error: 'User is not diamond hands' }, { status: 400 })
  }

  if (await attestedDiamondHands(walletAddress)) {
    return NextResponse.json({ error: 'User has attestation' }, { status: 400 })
  }
  const lock = new Lock({
    id: key,
    lease: 5000,
    redis: redis,
  })

  if (await lock.acquire()) {
    const signedResponse = await signDiamondHand(walletAddress);
    await redis.set(key, {signedResponse}, {ex: ATTESTATION_DEADLINE});
    return NextResponse.json({ signedResponse })
  } else {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429})
  }

}
