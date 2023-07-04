<!--toc:start-->
- [About The Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)
<!--toc:end-->

<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Xtreamly-Team/Xtreamly_SDK">
    <img src="https://xtreamly.b-cdn.net/Xtreamly.jpg" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Xtreamly SDK</h3>

  <p align="center">
    The SDK to use Xtreamly
    <br />
    <a href="https://github.com/Xtreamly-Team/Xtreamly_SDK"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <!-- TODO: Add Demo -->
    <a href="https://github.com/Xtreamly-Team/Xtreamly_SDK">View Demo</a>
    ·
    <a href="https://github.com/Xtreamly-Team/Xtreamly_SDK/issues">Report Bug</a>
    ·
    <a href="https://github.com/Xtreamly-Team/Xtreamly_SDK/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<!-- TODO: Add screenshot -->
<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

Xtreamly is an account abstraction service for Web3. Currently, we provide Auth (i.e. SSI) and proxy accounts. You can program your proxy account using lua to automatically do ERC20 transactions on the behalf of your real account. On top of that you can bring your own data and sign up to third party DApps via Xtreamly.`

You can create your own UI based on this SDK. Currently, there is no official one.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ### Built With -->
<!---->
<!-- * [![TypeScript][Next.js]][Next-url] -->
<!-- * [![Ethers][React.js]][React-url] -->
<!-- * [![Dfinity][Vue.js]][Vue-url] -->

<!-- GETTING STARTED -->
## Getting Started

You can use this package either in browser or in Node. All the functionality is accessible via three classes: AuthHandler, ProxyHandler and EVMHandlerV5. First two are self-explanatory, the third is a utils class for interaction with Web3 without the need to resort to ethers.js directly. 

All the Web3 functionality is based on ethers.js and communication with backend (ICP-Canister) is handled by dfinity-js library. 

Note that we're currently in alpha stage. Feel free to report any bug here our via email linked below. Also, any contribution is welcome.

### Prerequisites
* node version 16 or a modern browser


### Installation
Install the library with your favorite package manager. 
* npm
  ```sh
  npm install xtreamly_sdk@latest
  ```
* pnpm
  ```sh
  pnpm install xtreamly_sdk@latest
  ```
* yarn
  ```sh
  yarn add xtreamly_sdk@latest
  ```

_Since we're in alpha, we can't gurantee API stability even in major versions_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

We provide two distinct functionalities: Auth and Proxy Account. You can use
either of those without using the other. 

There are three classes you need to use. First two are self explanatory, ProxyHandler 
for all functionalities related to proxy account and AuthHander for auth and SSI features.
The third one is EVMHandler which both said classes use. It's an abstraction layer that wraps
ethers.js for our use cases.

Note that all three classes have an async initialize method that should be called before using
their methods.

A typical usage consists of three steps:

</br>
</br>

**1. Prepare provider and signer:**

To communicate with Web3, you need to have an account (private/public key pair) and a connection to rpc node. These are abstracted in ethers.js as provider and signer objects. These objects are required to initialize EVMHandler and subsequently for all other classes of SDK. 

Usually, you either want to use MetaMask or have public/private keys and rpc node (i.e. our Ganache RPC address) in your code. 
When using MetaMask you need to add our test Ganache network and account to your MetaMask manually.

RPC address and test account:
```ts
const testEthNetwork = 'https://test.xtreamly.io:8644'
const testPrivateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
```

Now we can create provider using JsonRpcProvier and signer using Wallet from ethers.js since Wallet implements signer interface.

```ts
const provider = new ethers.providers.JsonRpcProvider(testEthNetwork);
const wallet = new Wallet(testPrivateKey, provider);
```


</br>
</br>

**2. Instantiate and initialize EVMHandler class:**

Constructor doesn't take any arguments so you just need to instantiate EVMHandler class.

```ts
const evmHandler = new EVMHandler()
```

Initalize method takes either a pair of provider and signer, or an injectedProvider which ought to be provided by MetaMask as window.ethereum object.

1. Using a pair of provided and signer:

```ts
await evmHandler.initialize(provider, wallet)
```

2. Using MetaMask:
```ts
await evmHandler.initialize(null, null, window.ethereum);
```

</br>
</br>

**3. Instantiate and initialize AuthHandler and ProxyHandler classes:**

For both use classes, you need to communicate with Xtreamly backend which currently runs as an [ICP](https://internetcomputer.org/) canister. To do so you'll need to have ICP canister ID as well as ICP network address. For testing purposes use the provided values:
```ts
const testCanisterHost = 'http://test.xtreamly.io:4942'
const testCanisterId = 'rrkah-fqaaa-aaaaa-aaaaq-cai'
```

_When our service goes live on ICP mainnet, you wouldn't need the network address_

For Auth:

```ts
const authHandler = new AuthHandler(evmHandler, testCanisterHost);
await authHandler.initialize();
```

For Proxy:

```ts
const proxyHandler = new ProxyHandler(evmHandler, testCanisterHost);
await proxyHandler.initialize();
```


</br>
</br>

**4.a Calling Auth Functions**

The overall workflow of authentication consists of two paths:
Saving data and Retrieving data. In the following schematic you can see the flow and functions needed for each.
<div style="display: flex; margin: 0px;">
<img style="margin: 0 auto;" src="https://xtreamly.b-cdn.net/Auth-Diagram.png" height="360" width="300" alt="Auth Diagram">
</div>
Verifiable Credential (or VC for short) encapsulates data itself along metadata and attaches a unique identifier called DID to it for future reference. You don't need to know much about it other than returning / saving the dids when user wants to save data and requesting / loading the dids when you want to retreive data from user.

The created VC would be encrypted and deployed as a smart contract on an EVM blockchain by SDK. 


Note that Xtreamly is totally agnostic about the data itself and its format. We just require it to be a string and not being too large since it should be deployed on the blockchain.

1- Saving Data:
* Create Verifiable Credentials for a self presented data:
```ts
const testData = 'Test_Data'
const createdVC = await authHandler.createSelfPresentedVCModel(canisterId, testData)
```

* Deploy the VC and:
```ts
const deployedContract = await authHandler.deployVCToEVM(createdVC);
```

* Inform canister about the deployed contract:
```ts
const canister_res = await authHandler.informCanisterAboutDeployedVCContract(canisterId, createdVC.did, deployedContract.address)
```

2- Retrieving Data:

* Ask canister for data:

The returned data would be exactly the data user had already saved using Xtreamly with provided did. You can't retreive data if you have forgotten its did.

Note that we have to have the did of data we're requesting. Currently, the last two arguments are not used since we're migrating to a new dynamic access control system.
```ts
const dataFromCanister = await authHandler.askVCFromCanister(canisterId, createdVC.did, '0x', '0x');
```


</br>
</br>

**4.b Calling Proxy Functions**

Before using proxy account you need to generate one. Since proxy account main function is to automate Web3 interactions, you need to approve the transfer of ERC20 tokens from your real account and also provide enough gas for it. Both these functions are available on ProxyHandler class. Finally, you can (re)program the proxy account by sending a script written in RHAI to Xtreamly.

* Generate proxy account:
```ts
const proxyAccount = await proxyHandler.generateProxyAccount(canisterId, wallet.address);
```

* Approve Transfer of ERC20:
```ts
const res = await proxyHandler.approveTransferToProxyAccount(BigInt(10), USDTContractAddress, proxyAccount.address)
```

* Sending ETH to pay for gas:
```ts
const chargeRes = await proxyHandler.chargeEthProxyAccount(proxyAccount, BigInt(10 ** 18));
```

* Programming proxy account:

Due to a limitation in RHAI implementation, we can't run scripts that have async functions in one go. That is why you need to supply two set of scripts, called Stage1 and Stage2, to sendScriptToProxyAccount function. Some functions need to be called in Stage1 while others in Stage2. 

The main function that can only be called in stage1 is balance_erc20. For stage2 it would be transfer_from_erc20. Some functions can be called in either stage, Namely among them is print_to_icp which prints a log in ICP container (You won't see the log, but we see). 

<!-- TODO: Add guide -->
There are also important constants to use in script. Chief among them are MY_PROXY_ACCOUNT and  STAGE1_RESULT. Remember to return a string from each stage. For more info about proxy scripting refer to the [Documentation](https://xtreamly-1.gitbook.io/sdk/).

In the sample script below, we're not using stage1, just returning a dummy string. The main action is happening in stage 2 in which we are transferring 5 USDT tokens from our proxy account to a random wallet we just generated.

To identify and program a proxy account, you also need the proxy account token which is saved as a field in ProxyAccount object returned from generateProxyAccount

```ts
const USDTContractAddress = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab'
const randomWallet = await evmHandler.generateWallet();

const proxyScriptStage1 = `return "OK";`
const proxyScriptStage2 =
`
print_to_icp(MY_PROXY_ACCOUNT);
transfer_from_erc20("${USDTContractAddress}","${wallet.address}", "${randomWallet.address}", 5 , MY_PROXY_ACCOUNT);
return "Stage 2 OK";
`
const proxyScript = new ProxyScript(proxyScriptStage1, proxyScriptStage2);
const res = await proxyHandler.sendScriptToProxyAccount(canisterId, proxyAccount.token, proxyScript);

```




_For more examples, please refer to the [Documentation](https://xtreamly-1.gitbook.io/sdk/)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

Our plan is to add these features as fast as possible, possibly in next month. Since we're in Alpha feel free to propose new features. 

- [ ] HTTP Outcalls in scripts
- [ ] Dynamic Permissions
- [ ] API Stability
- [ ] Lua Scripting
- [ ] Applets

See the [open issues](https://github.com/Xtreamly-Team/Xtreamly_SDK/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

All tests are run using jest. You can run them using:
```sh
npm run test
```
_Replace your package manager in case you don't use npm_

It's highly recommended to run tests before opening pull request. Also add tests for any
new features in your pull request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Xtreamly Team - info@xtreamly.io.com

Project Link: [https://github.com/Xtreamly-Team/Xtreamly_SDK](https://github.com/Xtreamly-Team/Xtreamly_SDK)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Xtreamly-Team/Xtreamly_SDK.svg?style=for-the-badge
[contributors-url]: https://github.com/Xtreamly-Team/Xtreamly_SDK/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Xtreamly-Team/Xtreamly_SDK.svg?style=for-the-badge
[forks-url]: https://github.com/Xtreamly-Team/Xtreamly_SDK/network/members
[stars-shield]: https://img.shields.io/github/stars/Xtreamly-Team/Xtreamly_SDK.svg?style=for-the-badge
[stars-url]: https://github.com/Xtreamly-Team/Xtreamly_SDK/stargazers
[issues-shield]: https://img.shields.io/github/issues/Xtreamly-Team/Xtreamly_SDK.svg?style=for-the-badge
[issues-url]: https://github.com/Xtreamly-Team/Xtreamly_SDK/issues
[license-shield]: https://img.shields.io/github/license/Xtreamly-Team/Xtreamly_SDK.svg?style=for-the-badge
[license-url]: https://github.com/Xtreamly-Team/Xtreamly_SDK/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[Typescript]: https://img.shields.io/badge/typescript.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
