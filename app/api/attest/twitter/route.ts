import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isTwitterAuthenticated, attestedTwitter } from "@/lib/twitter"
import { signTwitter } from '@/lib/signing/twitter';
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

  if (!isTwitterAuthenticated(session)) {
    return NextResponse.json({ error: 'User has not authenticated twitter' }, { status: 400 })
  }

  if (await attestedTwitter(walletAddress)) {
    return NextResponse.json({ error: 'User has attestation' }, { status: 400 })
  }

  const key = `${walletAddress}-twitter`;
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

      const signedResponse = await signTwitter(
        session.user?.linkedAccounts?.twitter.split(':')[0],
        walletAddress,
      );
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
