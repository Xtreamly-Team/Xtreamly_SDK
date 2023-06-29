import { ContractType, EVMHandlerV5 } from "./evm_handler";
import { createAgent, createActor, HttpAgent } from "./icp_utilities";

// TODO: Add functionality for user to easily top up their proxy account with ETH
// So that proxy account would be able to transfer.

export class ProxyAccount {
    token: string;
    address: string;
    constructor(token: string, address: string) {
        this.token = token;
        this.address = address;
    }
}

export class ProxyScript {
    stage_1: string;
    stage_2: string;

    constructor(stage_1: string, stage_2: string) {
        this.stage_1 = stage_1
        this.stage_2 = stage_2
    }
}

export class ProxyHandler {
    proxyAccounts: Map<string, ProxyAccount>;
    host: string = "";
    is_snap = false;
    // WARN: This should be initialized
    evmHandler: EVMHandlerV5
    agent: HttpAgent | null = null;

    constructor(evmHandler: EVMHandlerV5, canister_host: string, is_snap: boolean = false) {
        this.evmHandler = evmHandler
        this.host = canister_host;
        this.is_snap = is_snap;
        this.proxyAccounts = new Map();
    }

    // You won't need to use the returned HTTPAgent.
    initialize = async (): Promise<HttpAgent> => {
        if (this.agent) {
            return this.agent;
        }
        const custom_fetch = this.is_snap ? fetch : null;
        this.agent = await createAgent(this.host, null, custom_fetch);
        return this.agent;
    };

    generateProxyAccount = async (
        canisterId: string,
        publicKey: string
    ): Promise<ProxyAccount | string> => {
        console.log(`Sending create proxy account request for
  ${publicKey}`);
        let idlFactory = ({ IDL }) => {
            return IDL.Service({
                create_new_proxy_account: IDL.Func([IDL.Text], [IDL.Text], []),
            });
        };
        let actor = await createActor(idlFactory, canisterId, this.agent);

        try {
            let res = (await actor.create_new_proxy_account(publicKey)) as stirng;

            console.log(`Returned response: ${res}`);
            let [receivedToken, receivedPublicKey] = (res as string).split(",");
            let proxyToken = receivedToken || '';
            let proxyPublicKey = receivedPublicKey ? `0x${receivedPublicKey}` : '';
            if (proxyToken && proxyPublicKey) {
                let proxyAccount = new ProxyAccount(proxyToken, proxyPublicKey);
                this.proxyAccounts.set(proxyAccount.token, proxyAccount);
                console.log(`Returning proxy account ${proxyAccount}`);
                return proxyAccount;
            }
            return '';
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    approveTransferToProxyAccount = async (
        amount: bigint,
        contractAddress: string,
        proxyAccountAddress: string,
    ) => {
        try {
            let contract = this.evmHandler.getContract(ContractType.ERC20,
                contractAddress);

            let tx = await this.evmHandler.approveTransferERC20(contract,
                proxyAccountAddress,
                amount);

            await tx.wait();

            return 'Done'
        } catch (e) {
            return e;
        }

    }

    // TODO: This should be done by the user because proxy account requires ETH to transfer tokens.
    topUpEthProxyAccount = async (
        amount: bigint,
        contractAddress: string,
        proxyAccount: ProxyAccount
    ) => {
        try {
            let contract = this.evmHandler.getContract(ContractType.ERC20,
                contractAddress);

            let tx = await this.evmHandler.transferEth(
                proxyAccount.address,
                amount);

            await tx.wait();

            return 'Done'
        } catch (e) {
            return e;
        }

    }

    sendScriptToProxyAccount = async (
        canisterId: string,
        proxyToken: string,
        proxyScript: ProxyScript,
    ) => {
        console.log(`Sending script for ${proxyToken} account token`);
        console.log(`Stage1: ${proxyScript.stage_1}`);
        console.log(`Stage2: ${proxyScript.stage_2}`);
        let idlFactory = ({ IDL }) => {
            return IDL.Service({
                execute_script: IDL.Func(
                    [IDL.Text, IDL.Text, IDL.Text],
                    [IDL.Text],
                    []
                ),
            });
        };
        let actor = await createActor(idlFactory, canisterId, this.agent);

        try {
            let res = await actor.execute_script(
                proxyToken,
                proxyScript.stage_1,
                proxyScript.stage_2,
            );
            console.log(`Returned response: ${res}`)
            return res;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };
}
