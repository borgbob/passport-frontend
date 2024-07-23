import { ethers } from 'ethers';
import proxyABI from './proxy-abi.json';


export function getProxy(signerOrProvider: ethers.JsonRpcSigner | ethers.JsonRpcProvider) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS!,
    proxyABI,
    signerOrProvider
  );
}
