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

describe('Test proxy functions', () => {

    let proxyAccount: ProxyAccount
    test('Should create proxy account', async () => {
        const res = await proxyHandler.generateProxyAccount(canisterId, accessWallet.address);
        expect(res).toBeInstanceOf(ProxyAccount);
        if (res instanceof ProxyAccount) {
            proxyAccount = res;
        }
    }, 20000)

    // NOTE: This is dependant on previous test
    test('Should approve transaction to proxy account', async () => {
        const res = await proxyHandler.approveTransferToProxyAccount(BigInt(10), USDTContractAddress, proxyAccount.address)
        expect(res).toEqual('Done')
    }, 20000)

    test('Should execute simplest script correctly', async () => {

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

    }, 20000)

    // NOTE: This is dependant on approve transaction test
    test('Should charge the proxy account', async () => {
        const currentBalanceEth = await evmHandler.getETHBalance(proxyAccount.address);

        const chargeRes = await proxyHandler.chargeEthProxyAccount(proxyAccount, BigInt(10 ** 18));

        expect(chargeRes).toEqual('Done');

        const newBalanceEth = await evmHandler.getETHBalance(proxyAccount.address);

        expect(newBalanceEth).toEqual((BigInt(currentBalanceEth) + BigInt(10 ** 18)).toString());

    });


    // NOTE: This is dependant on previous test
    test('Should execute transfering ERC20 to random wallet', async () => {

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

        let randomWalletUSDTBalance = await evmHandler.getERC20Balance(evmHandler.getContract(ContractType.ERC20, USDTContractAddress), randomWallet.address)

        console.log(randomWallet.address);
        console.log(randomWalletUSDTBalance);

        expect(randomWalletUSDTBalance).toEqual("5");

    }, 20000)

})



