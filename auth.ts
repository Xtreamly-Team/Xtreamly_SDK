import { createActor, createAgent, HttpAgent } from "./icp_utilities";
import { EVMHandler } from "./evm_handler";
import { deployVCContract } from "../../web3_utils/ethereum/ethereum_call";

// TODO: Add proper error handling
export class VCModel {
    raw_string: string;
    vc: string;
    proof: string;
    did: string;
    data: string;
    issuer: string;

    constructor(
        raw_string: string, vc: string, proof: string, did: string, data: string, issuer: string) {
        this.raw_string = raw_string;
        this.vc = vc;
        this.proof = proof;
        this.did = did;
        this.data = data;
        this.issuer = issuer;
    }

    toString() {
        return `
      vc: ${this.vc},
      proof: ${this.proof},
      did: ${this.did},
      data: ${this.data},
      issuer: ${this.issuer},
      `;
    }
}

export class AuthHandler {
    // WARN: This should be initialized?
    evmHandler: EVMHandler
    host: string = "";
    is_snap = false;
    agent: HttpAgent | null = null;

    constructor(evmHandler: EVMHandler, host: string, is_snap: boolean = false) {
        this.evmHandler = evmHandler
        this.host = host
        this.is_snap = is_snap
    }

    // You won't need to use the returned HTTPAgent.
    initialize = async (): Promise<HttpAgent> => {
        if (this.agent) {
            return this.agent;
        }
        const custom_fetch = this.is_snap ? fetch : null;
        this.agent = await createAgent(this.host, null, custom_fetch);
        // this.agent = new HttpAgent({ host: this.host });
        // let rootKey = await this.agent.fetchRootKey();
        return this.agent;
    };

    // async createAgent(
    //     host: string,
    //     fetch
    // ) {
    //     if (fetch) {
    //         return await createAgent(host, null, fetch);
    //     } else {
    //         return await createAgent(host, null, null);
    //     }
    // }

    // async createActor(
    //     canisterId: string,
    //     agent,
    // ) {
    //     let idlFactory = ({ IDL }) =>
    //         IDL.Service({
    //             create_vc_self_presented: IDL.Func([IDL.Text], [IDL.Text], []),
    //         });
    //     let actor = createActor(idlFactory, canisterId, agent);
    //     return actor;
    // }

    // This is used by DApps that want user to save data as VC
    async createSelfPresentedVCModel(
        canisterId: string,
        selfPresentedData: string,
    ) {
        console.log(`Sending self presented data to canister
  ${selfPresentedData}`);
        let idlFactory = ({ IDL }) =>
            IDL.Service({
                create_vc_self_presented: IDL.Func([IDL.Text], [IDL.Text], []),
            });
        let actor = createActor(idlFactory, canisterId, this.agent);

        let res = ''
        try {
            res = `${await actor.create_vc_self_presented(
                selfPresentedData,
            )}`;
            console.log(`Returned raw self presented VC from canister
  ${res}`);
        } catch (e) {
            console.error(e);
        }

        const vc_proof_pair = res.split("\n");

        const vc_raw = vc_proof_pair[0] as string;
        const proof_raw = vc_proof_pair[1] as string;

        const vc_raw_jsoned = JSON.parse(vc_raw);
        const proof = JSON.parse(proof_raw);

        const did = proof["verification_method"];

        const data = vc_raw_jsoned["credential_subject"]["data"];
        const issuer = vc_raw_jsoned["issuer"];

        const vc = new VCModel(res, vc_raw, proof, did, data, issuer);

        console.log(vc)

        return vc
    };

    async deployVCToEVM(vc: VCModel) {
        const deployedContract = await this.evmHandler.deployVCContract(
            vc.did,
            vc.data,
            vc.issuer,
            'SUBJECT',
        )
        console.log(deployedContract)
        return await deployedContract.getAddress();
    }


    // This is used by DApps that want user to save data as VC
    async informCanisterAboutDeployedVCContract(
        canisterId: string,
        did: string,
        contractAddress: string
    ) {
        console.log(`Sending deployed vc contract address to canister ${contractAddress} and did: ${did}`);
        const idlFactory = ({ IDL }) => {
            return IDL.Service({
                present_did_address: IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
            });
        };
        let actor = createActor(idlFactory, canisterId, this.agent);
        let res = ''
        try {
            res = `${await actor.present_did_address(did, contractAddress)}`
        } catch (e) {
            console.error(e);
        }

        return res
    };

    // This is used by DApps that only want to ask data to authenticate users
    async askVCFromCanister(
        host: string,
        canisterId: string,
        did: string,
        dapp_public: string,
        proxy_public: string,
    ): Promise<string> {
        let idlFactory = ({ IDL }) => {
            return IDL.Service({
                get_vc: IDL.Func(
                    [IDL.Text, IDL.Text, IDL.Text],
                    [IDL.Text],
                    [],
                ),
            });
        };
        let agent = await createAgent(host, null, this.m_fetch);
        let actor = createActor(idlFactory, canisterId, agent);

        let res = ''

        try {
            res = `${await actor.get_vc(
                did,
                dapp_public,
                proxy_public,
            )}`;
        } catch {
            // Won't do anything here since the error is not related to us, its related
            // to snap not being able to verify certificate
        }

        return res;
    }


    // initialize = async (): Promise<HttpAgent> => {
    //   if (this.agent) {
    //     return this.agent;
    //   }
    //   const custom_fetch = this.is_snap ? fetch : null;
    //   this.agent = await createAgent(this.host, null, custom_fetch);
    //   // this.agent = new HttpAgent({ host: this.host });
    //   // let rootKey = await this.agent.fetchRootKey();
    //   return this.agent;
    // };
    //
    // callCanisterCreateProxyAccount = async (
    //   canisterId: string,
    //   publicKey: string
    // ) => {
    //   console.log(`Sending create proxy account request for
    // ${publicKey}`);
    //   let idlFactory = ({ IDL }) => {
    //     return IDL.Service({
    //       create_new_proxy_account: IDL.Func([IDL.Text], [IDL.Text], []),
    //     });
    //   };
    //   let actor = await createActor(idlFactory, canisterId, this.agent);
    //
    //   try {
    //     let res = await actor.create_new_proxy_account(publicKey);
    //     [this.proxyToken, this.proxyPublicKey] = (res as string).split(",");
    //     this.proxyPublicKey = `0x${this.proxyPublicKey}`;
    //     console.log(`Returned response:
    //   public key: ${this.proxyPublicKey},
    //   token: ${this.proxyToken}`);
    //     return [this.proxyToken, this.proxyPublicKey];
    //   } catch (e) {
    //     console.error(e);
    //   }
    //
    //   return "Some Error";
    // };

}

