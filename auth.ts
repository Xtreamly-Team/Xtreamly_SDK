import { createActor, createAgent, HttpAgent } from "./icp_utilities";

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
    // This is used by DApps that want user to save data as VC
    async createSelfPresentedVCModel(
        host: string,
        canisterId: string,
        selfPresentedData: string,
    ) {
        let idlFactory = ({ IDL }) =>
            IDL.Service({
                create_vc_self_presented: IDL.Func([IDL.Text], [IDL.Text], []),
            });
        let agent = await createAgent(host, null, fetch)
        let actor = createActor(agent, canisterId, idlFactory);

        let res = ''
        try {
            res = `${await actor.create_vc_self_presented(
                selfPresentedData,
            )}`;
        } catch {
        }

        const vc_proof_pair = res.split("\n");

        const vc_raw = vc_proof_pair[0];
        const proof_raw = vc_proof_pair[1];

        const vc = JSON.parse(vc_raw);
        const proof = JSON.parse(proof_raw);

        const did = proof["verification_method"];

        const data = vc["credential_subject"]["data"];
        const issuer = vc["issuer"];

        return new VCModel(res, vc, proof, did, data, issuer);
    };

    // This is used by DApps that want user to save data as VC
    async informCanisterAboutDeployedVCContract(
        host: string,
        canisterId: string,
        did: string,
        contractAddress: string
    ) {
        const idlFactory = ({ IDL }) => {
            return IDL.Service({
                present_did_address: IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
            });
        };
        let agent = await createAgent(host, null, fetch)
        let actor = createActor(agent, canisterId, idlFactory);
        let res = ''
        try {
            res = `${await actor.present_did_address(did, contractAddress)}`
        } catch {
            // Won't do anything here since the error is not related to us, its related
            // to snap not being able to verify certificate
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
        let agent = await createAgent(host, null, fetch)
        let actor = createActor(agent, canisterId, idlFactory);

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

}

