import { Contract, ContractFactory, Signer } from "ethers";
import { ethers } from "ethers";
export { Contract } from "ethers";

export const parseUnits = ethers.utils.parseUnits;

import ERC20 from "./ERC20.json";
import { VCSmartContractABI, VCSmartContractByteCode } from "./VC_SmartContracter_Bin";
import { BaseContract } from "ethers";

type Web3Provider = ethers.providers.Web3Provider;
type JsonRpcSigner = ethers.providers.JsonRpcSigner;
type JsonRpcProvider = ethers.providers.JsonRpcProvider;
type ExternalProvider = ethers.providers.ExternalProvider;

type Provider = ethers.providers.Provider;

export enum ContractType {
    ERC20,
    ERC721,
}



export class EVMHandler {
    provider: Provider;
    signer: Signer;

    constructor() {
    }

    // Pass window.ethereum as injectedProvider when using a metamask
    // TODO: Revert the get_permission value or change its name to got_permission
    initialize = async (provider?: Provider, signer?: Signer, injectedProvider?: ExternalProvider) => {

        if (provider && signer) {
            this.provider = provider
            this.signer = signer;
            return;
        }
        if (injectedProvider) {
            const provider = new ethers.providers.Web3Provider(injectedProvider)
            this.provider = provider;
            this.signer = provider.getSigner();
        }

    };




    // NOTE: We return addresses as lower case
    getAccountAddress = async () => {
        return (await this.signer.getAddress()).toString().toLowerCase();
    };
    getContract(contractType: ContractType, contractAddress: string): Contract {
        let abi = ERC20.abi;
        if (contractType == ContractType.ERC721) {
            // abi = ERC721.abi;
        }
        return new Contract(contractAddress, abi, this.signer);
    }

    getERC20Symbol = async (contract: Contract) => {
        return await contract.symbol();
    };

    getERC20Balance = async (contract: Contract, account: string) => {
        console.log(`Getting balance for ${account}`);
        return (await contract.balanceOf(account)).toString();
    };

    getETHBalance = async (account: string) => {
        console.log(`Getting balance for ${account}`);
        return (await this.provider.getBalance(account)).toString();
    };

    // NOTE: that you need to await on the return value which is transaction
    // receivpt
    // await tx.wait();
    transferEth = async (toAddress: string, amount: bigint) => {
        console.log(`Transfering ${amount} ETH to ${toAddress}`);
        return await this.signer.sendTransaction({
            to: toAddress,
            value: amount,
        });
    }

    // NOTE: that you need to await on the return value which is transaction
    // receivpt
    // await tx.wait();
    transferERC20 = async (
        contract: Contract,
        toAddress: string,
        amount: bigint
    ) => {
        console.log(`Transfering ${amount}
                of ${await contract.symbol()}
                from ${await this.getAccountAddress()}
                to ${toAddress}`);
        return await contract.transfer(toAddress, amount);
    };

    // NOTE: that you need to await on the return value which is transaction
    // receivpt
    // await tx.wait();
    approveTransferERC20 = async (
        contract: Contract,
        toAddress: string,
        amount: bigint
    ) => {
        console.log(`Approving ${amount}
                of ${await contract.symbol()}
                from ${await this.getAccountAddress()}
                to ${toAddress}`);
        return await contract.approve(toAddress, amount);
    };

    deployContract = async (
        abi: string,
        byteCode: string
    ) => {
        const myContractFactory = new ContractFactory(abi, byteCode, this.signer)
        const contract = await myContractFactory.deploy();
        return contract
    }


    generateWallet = async () => {
        const array = new Uint8Array(32);
        global.crypto.getRandomValues(array);
        let id = ""
        array.forEach((e) => {
            let converted = Number(e).toString(16)
            if (converted.length === 1) {
                converted = '0' + converted
            }

            id = id + converted
        })
        console.log(id);
        let privateKey = "0x" + id;

        let wallet = new ethers.Wallet(privateKey);
        return wallet;
    }


}

// This works with Version 6 of ethers, which can't be used for now
// export class EVMHandler {
//     provider: BrowserProvider;
//     signer: JsonRpcSigner;
//     // TODO: Type this to JsonRpcProvider
//     injectedProvider: any;
//
//     constructor(injectedProvider?) {
//         if (injectedProvider === undefined) {
//             this.injectedProvider = window.ethereum;
//         }
//     }
//
//     initialize = async () => {
//         this.provider = new BrowserProvider(this.injectedProvider);
//         this.signer = await this.provider.getSigner();
//     };
//
//     promptMetaMaskChooseWallet = async () => {
//         const permissions = await window.ethereum.request({
//             method: "wallet_requestPermissions",
//             params: [
//                 {
//                     eth_accounts: {},
//                 },
//             ],
//         });
//         // TODO: Check permissions
//
//         let res = await window.ethereum.request({ method: "eth_requestAccounts" });
//
//         if (res.length === 0) {
//             return "Either metamask is locked or user rejected choosing";
//         } else {
//             return res[0];
//         }
//     };
//
//     setOnMetaMaskWalletChangeHandler = (
//         handleAccountsChanged: (accounts: string[]) => void
//     ) => {
//         window.ethereum.on("accountsChanged", handleAccountsChanged);
//     };
//
//     getAccountAddress = async () => {
//         return await this.signer.getAddress();
//     };
//     getContract(contractType: ContractType, contractAddress: string): Contract {
//         let abi = ERC20.abi;
//         if (contractType == ContractType.ERC721) {
//             // abi = ERC721.abi;
//         }
//         return new Contract(contractAddress, abi, this.signer);
//     }
//
//     getERC20Symbol = async (contract: Contract) => {
//         return await contract.symbol();
//     };
//
//     getERC20Balance = async (contract: Contract, account: string) => {
//         console.log(`Getting balance for ${account}`);
//         return await contract.balanceOf(account);
//     };
//
//     // Note that you need to await on the return value which is transaction
//     // receivpt
//     // await tx.wait();
//     transferERC20 = async (
//         contract: Contract,
//         toAddress: string,
//         amount: bigint
//     ) => {
//         console.log(`Transfering ${amount}
//                 of ${await contract.symbol()}
//                 from ${await this.getAccountAddress()}
//                 to ${toAddress}`);
//         return await contract.transfer(toAddress, amount);
//     };
//
//     approveTransferERC20 = async (
//         contract: Contract,
//         toAddress: string,
//         amount: bigint
//     ) => {
//         console.log(`Approving ${amount}
//                 of ${await contract.symbol()}
//                 from ${await this.getAccountAddress()}
//                 to ${toAddress}`);
//         return await contract.approve(toAddress, amount);
//     };
//
//     deployContract = async (
//         abi: string,
//         byteCode: string
//     ) => {
//         const myContractFactory = new ContractFactory(abi, byteCode, this.signer)
//         const contract = await myContractFactory.deploy();
//         return contract
//     }
//
//     deployVCContract = async (
//         id_value: string,
//         data_value: string,
//         issuer_value: string,
//         subject_value: string,
//     ) => {
//         // TODO: Add contract abi and bytecode
//         // TODO: Is casting ok here?
//         const deployedContract = (await this.deployContract(
//             VCSmartContractABI, VCSmartContractByteCode)) as unknown as BaseContract
//
//         const tx = await deployedContract.setData(
//             id_value, data_value, issuer_value, subject_value
//         );
//
//         await tx.wait();
//
//         return deployedContract;
//
//     }
//
// }
