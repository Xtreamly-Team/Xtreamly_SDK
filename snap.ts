export const defaultSnapOrigin = 'local:http://localhost:8080';
export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
    permissionName: string;
    // Also known as origin
    id: string;
    version: string;
    initialPermissions: Record<string, unknown>;
};

// TODO: Make sure user has installed Metamask Flask
export class SnapHandler {
    connectedSnapOrigin: string = ''
    connectedSnapParams: Record<'version' | string, unknown> = {}

    constructor(
    ) {
        if (!window.ethereum) {
            throw ReferenceError();
        }
    }
    /**
     * Get the installed snaps in MetaMask.
     *
     * @returns The snaps installed in MetaMask.
     */
    getInstalledSnaps = async (): Promise<GetSnapsResponse> => {
        return (await window.ethereum.request({
            method: 'wallet_getSnaps',
        })) as unknown as GetSnapsResponse;
    };

    /**
     * Connect a snap to MetaMask.
     *
     * @param snapId - The ID of the snap.
     * @param params - The params to pass with the snap to connect.
     */
    connectToSnap = async (
        origin: string = defaultSnapOrigin,
        params: Record<'version' | string, unknown> = {},
    ) => {
        await window.ethereum.request({
            method: 'wallet_requestSnaps',
            params: {
                [origin]: params,
            },
        });
    };

    /**
     * Get the snap from MetaMask.
     *
     * @param version - The version of the snap to install (optional).
     * @returns The snap object returned by the extension.
     */
    // getInstalledSnap = async (version?: string): Promise<Snap | undefined> => {
    //     try {
    //         const snaps = await this.getInstalledSnaps();
    //
    //         return Object.values(snaps).find(
    //             (snap) =>
    //                 snap.id === defaultSnapOrigin && (!version || snap.version === version),
    //         );
    //     } catch (e) {
    //         console.log('Failed to obtain installed snap', e);
    //         return undefined;
    //     }
    // };



    /**
     * Invoke the an arbitrary method
     */

    invokeSnap = async (method: string) => {
        let res = await window.ethereum.request({
            method: 'wallet_invokeSnap',
            params: { snapId: this.connectedSnapOrigin, request: { method: method } },
        });
        return res;
    };

    isLocalSnap = (snapId: string) => snapId.startsWith('local:');
}
