const ethers = require('ethers');
const crypto = require('crypto');

const wallet = ethers.Wallet.createRandom();
const jwtSecret = crypto.randomBytes(16).toString('hex');

console.log('GITHUB_ID=')
console.log('GITHUB_SECRET=')
console.log('TWITTER_ID=')
console.log('TWITTER_SECRET=')
console.log(`JWT_SECRET=${jwtSecret}`)
console.log(`PRIVATE_KEY=${wallet.privateKey}`)
console.log('EAS_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
console.log('SCHEMA_REGISTRY_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3')
console.log('NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS=0xd0141e899a65c95a556fe2b27e5982a6de7fdd7a')
