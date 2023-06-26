import { accessWallet, canisterId, localCanisterHost, provider, USDTContractAddress } from "./test/env";

import { ProxyAccount, ProxyHandler } from "./proxy";
import { ContractType, EVMHandlerV5 } from "./evm_handler";


const evmHandler = new EVMHandlerV5();
const proxyHandler = new ProxyHandler(evmHandler, localCanisterHost);



beforeAll(async () => {
    await evmHandler.initialize(provider, accessWallet);
    await proxyHandler.initialize();
});

describe('Test proxy functions', () => {

    let proxyAccount: ProxyAccount
    test('Should create proxy account', async () => {
        const res = await proxyHandler.generateProxyAccount(canisterId, accessWallet.address);
        expect(res).toBeInstanceOf(ProxyAccount);
        if (res instanceof ProxyAccount) {
            proxyAccount = res;
        }
    }, 20000)

    test('Should approve transaction to proxy account', async () => {
        const res = await proxyHandler.approveTransferToProxyAccount(BigInt(10), USDTContractAddress, proxyAccount.address)
        expect(res).toEqual('Done')
    }, 20000)

})



