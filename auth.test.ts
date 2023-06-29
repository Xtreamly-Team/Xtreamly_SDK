import { ethers, Wallet } from "ethers";
import { AuthHandler, VCModel } from "./auth";
import { EVMHandlerV5 } from "./evm_handler";
import { localCanisterHost, localEthNetwork, localWalletPrivateKey, canisterId } from "./test/env";

const provider = new ethers.providers.JsonRpcProvider(localEthNetwork);

const accessWallet = new Wallet(localWalletPrivateKey, provider);

const evmHandler = new EVMHandlerV5();
const authHandler = new AuthHandler(evmHandler, localCanisterHost, false);




beforeAll(async () => {
    await evmHandler.initialize(provider, accessWallet);
    await authHandler.initialize();
});

describe.skip('Test auth functions', () => {
    const testSelfPresentedData = 'Test_Data'
    let createdVC: VCModel;

    // We need 20 seconds since canister is slow to respond
    test(`Should create vc from data`, async () => {
        createdVC = await authHandler.createSelfPresentedVCModel(canisterId, testSelfPresentedData);
        // The encrypted data must match since it only depends on the test data
        expect(createdVC.data).toEqual('01010101010101010101010101010101556472755e4560756001010101010101');
    }, 20000)

    // NOTE: This test is dependant on the previous one
    test('Deploy the contract, and inform the canister', async () => {
        const deployedContract = await authHandler.deployVCToEVM(createdVC);
        const canister_res = await authHandler.informCanisterAboutDeployedVCContract(canisterId, createdVC.did, deployedContract.address)
        expect(canister_res).toBeTruthy();
    }, 20000)

    test('Should retrieve the same data that presented to canister in start', async () => {
        const dataFromCanister = await authHandler.askVCFromCanister(canisterId, createdVC.did, '0x', '0x');

        expect(dataFromCanister).toEqual(testSelfPresentedData);
    })
});