import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isDiamondHands, attestedDiamondHands } from "@/lib/diamond-hands"
import { signDiamondHand } from '@/lib/signing/diamond-hand';

import { getRedisInstance } from "@/lib/redis";
import { Lock } from "@upstash/lock";
import { ATTESTATION_DEADLINE } from "@/lib/config";
import { getWalletAddress } from "@/lib/utils";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session === undefined || session === null) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 400 })
  }

  const walletAddress = getWalletAddress(session)
  if (!walletAddress) {
    return NextResponse.json({ error: 'No wallet address found in session' }, { status: 400 })
  }

  if (!isDiamondHands(walletAddress)) {
    return NextResponse.json({ error: 'User is not diamond hands' }, { status: 400 })
  }

  if (await attestedDiamondHands(walletAddress)) {
    return NextResponse.json({ error: 'User has attestation' }, { status: 400 })
  }

  const key = `${walletAddress}-diamond-hand`;
  const redis = getRedisInstance();

  const lock = new Lock({
    id: `${key}-lock`,
    lease: 5000,
    redis: redis,
  })

  if (await lock.acquire()) {
    try {
      const current = await redis.get(key);
      if (current) {
        return NextResponse.json(current);
      }
      const signedResponse = await signDiamondHand(walletAddress);
      await redis.set(key, {signedResponse}, {ex: ATTESTATION_DEADLINE});
      return NextResponse.json({ signedResponse })
    }
    finally {
      await lock.release()
    }
  } else {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429})
  }

}
