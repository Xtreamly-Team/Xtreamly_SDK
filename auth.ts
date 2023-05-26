import { createActor, createAgent, HttpAgent } from "./icp_utilities";
import { EVMHandlerV5 } from "./evm_handler";
import { BaseContract } from "ethers";

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
    evmHandler: EVMHandlerV5
    host: string = "";
    is_snap = false;
    agent: HttpAgent | null = null;

    constructor(evmHandler: EVMHandlerV5, host: string, is_snap: boolean = false) {
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

        let res = '';
        try {
            res =
                (await actor.create_vc_self_presented(
                    selfPresentedData,
                )) as string;
            console.log(`Returned raw self presented VC from canister
  ${res}`);
        } catch (e) {
            console.error(e);
            throw e;
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

        return vc
    };

    async deployVCToEVM(vc: VCModel): Promise<BaseContract> {
        const deployedContract = await this.evmHandler.deployVCContract(
            vc.did,
            vc.data,
            vc.issuer,
            'SUBJECT',
        )
        console.log(deployedContract)
        return deployedContract
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
                present_did_address: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
            });
        };
        let actor = createActor(idlFactory, canisterId, this.agent);
        try {
            let res = await actor.present_did_address(did, contractAddress)

            console.log(`Returned inform canister about deployed VC contract
  ${res}`);
            return res
        } catch (e) {
            console.error(e);
        }

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
            return IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []);
        };
        let actor = createActor(idlFactory, canisterId, this.agent);


        try {
            let res = (await actor.get_vc(
                did,
                dapp_public,
                proxy_public,
            )) as string;
            return res;
        } catch (e) {
            console.error(e)
            throw e;
        }
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

