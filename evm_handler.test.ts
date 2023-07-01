import { ContractType, EVMHandler } from "./evm_handler";

import { accessWallet, localWalletPublicKey, provider, USDTContractAddress } from "./test/env";

const evmHandler = new EVMHandler();

beforeAll(async () => {
    await evmHandler.initialize(provider, accessWallet);
}, 5);

describe('Tests EVM interactions', () => {

    test('Should get correct account address and symbol', async () => {
        expect(await evmHandler.getAccountAddress()).toEqual(localWalletPublicKey);
    })

    test('Should get correct contract symbol', async () => {
        const contract = evmHandler.getContract(ContractType.ERC20, USDTContractAddress);
        expect(await evmHandler.getERC20Symbol(contract)).toEqual('USDT');
    })

    test(`Should transfer and get balance correctly`, async () => {
        const contract = evmHandler.getContract(ContractType.ERC20, USDTContractAddress);

        const randomWallet = await evmHandler.generateWallet();

        const randomAddress = randomWallet.address;

        const tx = await evmHandler.transferERC20(contract, randomAddress, BigInt(10));
        await tx.wait();

        const randomAddressBalance = await evmHandler.getERC20Balance(contract, randomAddress);

        expect(randomAddressBalance).toEqual('10')

    });

    test(`Should transfer Eth correctly`, async() => {
        const randomWallet = await evmHandler.generateWallet();

        const randomAddress = randomWallet.address;

        const tx = await evmHandler.transferEth(randomAddress, BigInt(10));
        await tx.wait();

        const randomAddressBalance = await evmHandler.getETHBalance(randomAddress);

        expect(randomAddressBalance).toEqual('10')

    });


    test(`Should approve and transfer to get balance correctly`, async () => {
        const contract = evmHandler.getContract(ContractType.ERC20, USDTContractAddress);
        const currentBalance = await evmHandler.getERC20Balance(contract, localWalletPublicKey);

        const trusteeWallet = await evmHandler.generateWallet();

        const approveTx = await evmHandler.approveTransferERC20(contract, trusteeWallet.address, BigInt(10));
        await approveTx.wait();

        const newHandler = new EVMHandler();

        await newHandler.initialize(provider, trusteeWallet);

        const randomWallet = await evmHandler.generateWallet();
        const randomAddress = randomWallet.address;

        const tx = await newHandler.transferERC20(contract, randomAddress, BigInt(10));
        await tx.wait();

        const randomAddressBalance = await evmHandler.getERC20Balance(contract, randomAddress);

        expect(randomAddressBalance).toEqual('10')

    });
});

