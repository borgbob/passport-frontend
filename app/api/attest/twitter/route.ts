import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isTwitterAuthenticated, attestedTwitter } from "@/lib/twitter"
import { signTwitter } from '@/lib/signing/twitter';
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
  const session = await auth();

  const redis = getRedisInstance();

  const key = `${walletAddress}-twitter`;
  const current = await redis.get(key);
  if (current) {
    return NextResponse.json(current);
  }

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

  const lock = new Lock({
    id: key,
    lease: 5000,
    redis: redis,
  })

  if (await lock.acquire()) {
    const signedResponse = await signTwitter(session.user?.linkedAccounts?.twitter.split(':')[0], walletAddress);
    await redis.set(key, {signedResponse}, {ex: ATTESTATION_DEADLINE});
    return NextResponse.json({ signedResponse })
  } else {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429})
  }

}
