import { type NextRequest, NextResponse } from "next/server";
import { JsonRpcProvider, Wallet } from "ethers";
import { auth } from "@/lib/auth";
import { EIP712Proxy } from "@ethereum-attestation-service/eas-sdk/dist/eip712-proxy";
import { isDiamondHands } from "@/lib/diamond-hands"
import { jsonStringifyBigInt } from "@/lib/utils"

import {
  PROXY_CONTRACT_ADDRESS,
  PRIVATE_KEY,
  ATTESTATION_CONFIG,
  isProd
} from "@/lib/config"


if (!PROXY_CONTRACT_ADDRESS) {
  throw new Error('PROXY_CONTRACT_ADDRESS is not set')
}

const PRIVATE_KEY = process.env.PRIVATE_KEY!;

const JSON_RPC_ENDPOINT = (() => {
  if (process.env.RPC_PROVIDER) {
    return process.env.RPC_PROVIDER;
  }

  if (isProd) {
    return 'https://avalanche-fuji-c-chain-rpc.publicnode.com/';
  }
})();

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

  const provider = new JsonRpcProvider(JSON_RPC_ENDPOINT)
  const signer = new Wallet(PRIVATE_KEY, provider);

  const proxy = new EIP712Proxy(PROXY_CONTRACT_ADDRESS, { signer: signer })

  const delegated = await proxy.getDelegated()

  const attestationType = ATTESTATION_CONFIG['diamond-hand'];

  const params = {
    schema: attestationType.schemaUID,
    recipient: walletAddress,
    expirationTime: 0n,
    revocable: false,
    refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    data: attestationType.encoder.encodeData([{
      name: 'hasDiamondHand',
      type: 'bool',
      value: true
    }]),
    value: 0n,
    deadline: 0n
  };

  const response = await delegated.signDelegatedProxyAttestation(params, signer);
  const signedResponse = jsonStringifyBigInt({
    message: response.message,
    signature: response.signature,
  })


  return NextResponse.json({ signedResponse })
}
