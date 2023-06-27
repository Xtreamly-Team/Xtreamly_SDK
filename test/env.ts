import { ethers, Wallet } from "ethers";

export const localEthNetwork = 'https://test.xtreamly.io:8644'
export const localCanisterHost = 'http://localhost:4943';

export const localWalletPrivateKey = '0x75a27d9d092a31ccbbeedebc3ed932111c89887f85fb64892d035ee3bb694842';
export const localWalletPublicKey = '0x89d09164592c1f06d43C07c89c8fA1A3BE23F1CC'

export const USDTContractAddress = '0x6811e81996BCCd00d1bD804382d850caAC0Cc2E0'

export const canisterId = 'rrkah-fqaaa-aaaaa-aaaaq-cai'

export const provider = new ethers.providers.JsonRpcProvider(localEthNetwork);
export const accessWallet = new Wallet(localWalletPrivateKey, provider);
