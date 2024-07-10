import { ethers } from 'ethers';


export function getProxy(signer: ethers.JsonRpcSigner) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS!,
    ["function attestByDelegation(string id, (bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data, (uint8 v, bytes32 r, bytes32 s) signature, address attester, uint64 deadline) delegatedRequest)"],
    signer
  )
}
