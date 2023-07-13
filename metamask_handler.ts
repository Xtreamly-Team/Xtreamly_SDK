import { EVMHandler } from "./evm_handler";

export class MetamaskHandler {
    constructor() { }

    initialize = async (): Promise<string> => {
        let res = await window.ethereum.request({ method: "eth_requestAccounts" });

        if (res.length === 0) {
            return "Either metamask is locked or user rejected choosing";
        } else {
            return res[0];
        }
    }


    // TODO: Is it needed
    promptMetaMaskChooseWallet = async () => {
        permissions = await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [
                {
                    eth_accounts: {},
                },
            ],
        });

    };

    setOnMetaMaskWalletChangeHandler = (
        handleAccountsChanged: (accounts: string[]) => void
    ) => {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
    };

    getCurrentSnaps = async () => {
        return await window.ethereum.request({
            method: 'wallet_getSnaps'
        });
    };


    /* 
    Used for connecting to a snap. You need to provide the snap address which is the url of the snap with "local:" or "npm:" prepended to it. 
    For example local:http://localhost:8090
    */
    connectToSnap = async (snapAddress: string) => {
        const res = await window.ethereum.request({
            method: 'wallet_requestSnaps',
            params: { [snapAddress]: {} }
        });
        return res;
    };

    callSnap = async (snapAddress: string, method: string) => {
        const res = await window.ethereum.request({
            method: 'wallet_snap',
            params: { snapId: 'local:http://localhost:8090', request: { method: method} }
        });
        return res;
    };


}
