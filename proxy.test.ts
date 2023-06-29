import { accessWallet, canisterId, localCanisterHost, provider, USDTContractAddress } from "./test/env";

import { ProxyAccount, ProxyHandler } from "./proxy";
import { ContractType, EVMHandlerV5 } from "./evm_handler";
import { ProxyScript } from "./proxy";


const evmHandler = new EVMHandlerV5();
const proxyHandler = new ProxyHandler(evmHandler, localCanisterHost);



beforeAll(async () => {
    await evmHandler.initialize(provider, accessWallet);
    await proxyHandler.initialize();
});

describe.skip('Test proxy functions', () => {

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

    test.skip('Should execute simplest script correctly', async () => {

        console.log(proxyAccount);

        const proxyScriptStage1 = `return "Stage 1 OK"`
        const proxyScriptStage2 =
            `
print_to_icp(STAGE1_RESULT);
print_to_icp(MY_PROXY_ACCOUNT);
return "Stage 2 OK"
`
        const proxyScript = new ProxyScript(proxyScriptStage1, proxyScriptStage2);

        const res = await proxyHandler.sendScriptToProxyAccount(canisterId, proxyAccount.token, proxyScript);

        console.log(res);

    }, 20000)

    // TODO: Do after proxy account topping up is added
    test.skip('Should execute script correctly', async () => {

        // First need to top up my proxy account
        
        const topUpRes = await proxyHandler.topUpProxyAccount(proxyAccount.address, BigInt(100));

        const randomWallet = await evmHandler.generateWallet();
        const proxyScriptStage1 = `return "OK";`
        const proxyScriptStage2 =
            `
    print_to_icp(MY_PROXY_ACCOUNT);
    transfer_from_erc20("${USDTContractAddress}","${accessWallet.address}", "${randomWallet.address}", 5 , MY_PROXY_ACCOUNT);
    return "Stage 2 OK";
        `

        const proxyScript = new ProxyScript(proxyScriptStage1, proxyScriptStage2);
        const res = await proxyHandler.sendScriptToProxyAccount(canisterId, proxyAccount.token, proxyScript);

        console.log(res);

        const randomWalletBalance = await evmHandler.getERC20Balance(evmHandler.getContract(ContractType.ERC20, USDTContractAddress), randomWallet.address)

        console.log(randomWalletBalance);

        expect(randomWalletBalance).toEqual("5");

    }, 20000)

})



