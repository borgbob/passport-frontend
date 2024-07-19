import { ethers } from 'ethers';
import proxyABI from './proxy-abi.json';


export function getProxy(signer?: ethers.JsonRpcSigner, provider?: ethers.JsonRpcProvider) {
  if (typeof(signer) === 'undefined' && typeof(provider) === 'undefined') {
    return new ethers.Contract(
      process.env.NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS!,
      proxyABI,
    );
  } else if (typeof(signer) !== 'undefined') {
    return new ethers.Contract(
      process.env.NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS!,
      proxyABI,
      signer
    )
  } else {
    return new ethers.Contract(
      process.env.NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS!,
      proxyABI,
      provider,
    )
  };
}
