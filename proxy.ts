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
            // return [this.proxyToken, this.proxyPublicKey];
        } catch (e) {
            console.error(e);
            throw e;
        }
    };
}
