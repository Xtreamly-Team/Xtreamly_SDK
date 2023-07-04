import { ethers, Wallet } from "ethers";

export const testEthNetwork = 'https://test.xtreamly.io:8644'
export const testCanisterHost = 'https://test.xtreamly.io:4942';

export const localWalletPrivateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
export const localWalletPublicKey = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'

export const USDTContractAddress = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab'

export const canisterId = 'rrkah-fqaaa-aaaaa-aaaaq-cai'

export const provider = new ethers.providers.JsonRpcProvider(testEthNetwork);
export const accessWallet = new Wallet(localWalletPrivateKey, provider);
