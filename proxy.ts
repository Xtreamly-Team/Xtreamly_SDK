import { createAgent, createActor, HttpAgent } from "./icp_utilities";

// TODO: Fix calling update functions error in snap. The cause is probably bls.js file in which
// WebAssembly is used
// CertificateVerificationError
//

export class ProxyAccount {
    token: string;
    address: string;
    constructor(token: string, address: string) {
        this.token = token;
        this.address = address;
    }
}

export class ProxyHandler {
    proxyAccounts: Map<string, ProxyAccount>;
    host: string = "";
    is_snap = false;
    agent: HttpAgent | null = null;

    constructor(host: string, is_snap: boolean = false) {
        this.host = host;
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

    callCanisterCreateProxyAccount = async (
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
            let proxyPublicKey = receivedPublicKey ? `0x${this.proxyPublicKey}` : '';
            if (this.proxyToken && this.proxyPublicKey) {
                let proxyAccount = new ProxyAccount(this.proxyToken, this.proxyPublicKey);
                this.proxyAccounts.set(proxyAccount.token, proxyAccount);
                return proxyAccount;
            }
            return '';
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    sendScriptToProxyAccount = async (
        canisterId: string,
        proxyToken: string,
        stage_1_script: string,
        stage_2_script: string
    ) => {
        console.log(`Sending script for ${proxyToken} account token`);
        console.log(`Stage1: ${stage_1_script}`);
        console.log(`Stage2: ${stage_2_script}`);
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
                stage_1_script,
                stage_2_script
            );
            console.log(`Returned response: ${res}`)
            return res;
            // return [this.proxyToken, this.proxyPublicKey];
        } catch (e) {
            console.error(e);
            throw e;
        }
    };
}
