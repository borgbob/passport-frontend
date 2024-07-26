'use server';

import type { Address } from 'viem';
import { JsonRpcProvider, Wallet } from "ethers";
import { EIP712Proxy } from "@ethereum-attestation-service/eas-sdk/dist/eip712-proxy";
import {
  PROXY_CONTRACT_ADDRESS,
  PRIVATE_KEY,
  ATTESTATION_CONFIG,
  JSON_RPC_ENDPOINT,
} from "@/lib/config"
import { jsonStringifyBigInt } from "@/lib/utils"


export async function signTwitter(twitterId: string, address: Address) {
  const provider = new JsonRpcProvider(JSON_RPC_ENDPOINT)
  const signer = new Wallet(PRIVATE_KEY, provider);
  const proxy = new EIP712Proxy(PROXY_CONTRACT_ADDRESS, { signer: signer })

  const delegated = await proxy.getDelegated()

  const attestationType = ATTESTATION_CONFIG['twitter'];

  const params = {
    schema: attestationType.schemaUID,
    recipient: address,
    expirationTime: 0n,
    revocable: false,
    refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    data: attestationType.encoder.encodeData([{
      name: 'twitterId',
      type: 'string',
      value: twitterId
    }]),
    value: 0n,
    deadline: 0n
  };

  const response = await delegated.signDelegatedProxyAttestation(params, signer);
  return jsonStringifyBigInt({
    message: response.message,
    signature: response.signature,
  })

}
