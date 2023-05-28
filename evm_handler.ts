import { Contract, ContractFactory } from "ethers";
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


export enum ContractType {
    ERC20,
    ERC721,
}

// TODO: Make two versions of this class each depending on different versions of
// ethers
export class EVMHandlerV5 {
    provider: JsonRpcProvider;
    signer: JsonRpcSigner;
    injectedProvider: ExternalProvider;

    constructor(injectedProvider?: ExternalProvider | undefined) {
        if (injectedProvider === undefined) {
            this.injectedProvider = window.ethereum;
        }
    }

    initialize = async (provider?: JsonRpcProvider, got_permission?: boolean) => {
        if (provider) {
            this.provider = provider
        }
        else {
            this.provider = new ethers.providers.Web3Provider(this.injectedProvider)
        }
        if (!got_permission) {
            await this.provider.send('eth_requestAccounts', []);
        }
        this.signer = this.provider.getSigner();
    };

    promptMetaMaskChooseWallet = async () => {
        const permissions = await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [
                {
                    eth_accounts: {},
                },
            ],
        });
        // TODO: Check permissions

        let res = await window.ethereum.request({ method: "eth_requestAccounts" });

        if (res.length === 0) {
            return "Either metamask is locked or user rejected choosing";
        } else {
            return res[0];
        }
    };

    setOnMetaMaskWalletChangeHandler = (
        handleAccountsChanged: (accounts: string[]) => void
    ) => {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
    };

    getAccountAddress = async () => {
        return await this.signer.getAddress();
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
        return await contract.balanceOf(account);
    };

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

    // NOTE: Isn't it better to move this into auth module?
    deployVCContract = async (
        id_value: string,
        data_value: string,
        issuer_value: string,
        subject_value: string,
    ): Promise<ethers.BaseContract> => {
        // TODO: Add contract abi and bytecode
        // TODO: Is casting ok here?
        const deployedContract = (await this.deployContract(
            VCSmartContractABI, VCSmartContractByteCode)) as unknown as BaseContract

        const tx = await deployedContract.setData(
            id_value, data_value, issuer_value, subject_value
        );

        await tx.wait();

        return deployedContract;

    }

}

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
