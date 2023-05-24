import { BrowserProvider, JsonRpcSigner, Contract, ContractFactory } from "ethers";
export { parseUnits, Contract } from "ethers";

import ERC20 from "./ERC20.json";
import { VCSmartContractABI, VCSmartContractByteCode } from "./VC_SmartContracter_Bin";


export enum ContractType {
    ERC20,
    ERC721,
}

export class Web3Handler {
    provider: BrowserProvider;
    signer: JsonRpcSigner;
    // TODO: Type this to JsonRpcProvider
    injectedProvider: any;

    constructor(injectedProvider) {
        if (injectedProvider === undefined) {
            this.injectedProvider = window.ethereum;
        }
    }

    initialize = async () => {
        this.provider = new BrowserProvider(this.injectedProvider);
        this.signer = await this.provider.getSigner();
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

    // Note that you need to await on the return value which is transaction
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

    deployVCContract = async (
        id_value: string,
        data_value: string,
        issuer_value: string,
        subject_value: string,
    ) => {
        const deployedContract = await this.deployContract('', '');

        const tx = await deployedContract.setData(
            id_value, data_value, issuer_value, subject_value
        );

        await tx.wait();

        return deployedContract;

    }

}
