import { ethers, Wallet } from "ethers";

export const localEthNetwork = 'https://test.xtreamly.io:8644'
export const localCanisterHost = 'http://localhost:4943';

export const localWalletPrivateKey = '0x9d8596d7b7de0a3be7b50eb81e0e0ee099d24eb33a758a623a711752b7523a03';
export const localWalletPublicKey = '0x50EFE2DF4748a29B804FA6A816fA3F4695da4d18'

export const USDTContractAddress = '0x3848043e22dF0eAAaF01F2228E044A28F36da14C'

export const canisterId = 'rrkah-fqaaa-aaaaa-aaaaq-cai'

export const provider = new ethers.providers.JsonRpcProvider(localEthNetwork);
export const accessWallet = new Wallet(localWalletPrivateKey, provider);
