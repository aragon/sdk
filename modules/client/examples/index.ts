/* MARKDOWN
---
title: Getting Started
---

## Getting Started With the Aragon SDK

### Before You Begin

The Aragon OSx SDK is Javascript agnostic, which means you can use it with any Javascript framework, including popular ones like React, Vite, or Vue.

However, keep in mind that because server-side rendering is not supported yet for some crypto packages, you will not be able to use a framework like NextJS. Only frameworks that run entirely on client-side are supported.

Also know that all documentation within this site is done with Typescript. You can read more about [Typescript here](https://www.typescriptlang.org/).

### Installing the SDK

First thing you want to do is install the Aragon OSx SDK package into your product. You can do this by using `npm` or `yarn`.

```bash
npm install @aragon/sdk-client
```
or
```bash
yarn add @aragon/sdk-client
```

### Setting up the Context

Then, you'll want to set up the Aragon OSx SDK context within your application to have access to the SDK functions. You can do this at any point within your app.

However, so you're not setting it up multiple times, we recommend you set it up as a [context hook](https://www.freecodecamp.org/news/react-context-for-beginners/) within Javascript application if you're using a framework like React, Vue, or other, or within the entry file of your app.
*/

import { Wallet } from "@ethersproject/wallet";
import { Context, ContextParams } from "@aragon/sdk-client";

// Set up your IPFS API key. You can get one either by running a local node or by using a service like Infura or Alechmy.
// Make sure to always keep these private in a file that is not committed to your public repository.
export const IPFS_API_KEY: string = "ipfs-api-key";

export const contextParams: ContextParams = {
  // Choose the network you want to use. You can use "goerli" or "mumbai" for testing, "mainnet" for Ethereum.
  network: "goerli",
  // Depending on how you're configuring your wallet, you may want to pass in a `signer` object here.
  signer: Wallet.createRandom(),
  // Optional on "rinkeby", "arbitrum-rinkeby" or "mumbai"
  // Pass the address of the  `DaoFactory` contract you want to use. You can find it here based on your chain of choice: https://github.com/aragon/core/blob/develop/active_contracts.json
  // Optional. Leave it empty to use Aragon's DAO Factory contract and claim a dao.eth subdomain
  daoFactoryAddress: "0x1234381072385710239847120734123847123",
  // Optional. Pass the address of the ensRegistry for networks other than Mainnet or Goerli.
  // It will default to the registry deployed by Aragon. You can check them here: https://github.com/aragon/osx/blob/develop/active_contracts.json
  ensRegistryAddress: "0x1234381072385710239847120734123847123",
  // Choose your Web3 provider: Cloudfare, Infura, Alchemy, etc.
  // Remember to change the list of providers if a different network is selected
  web3Providers: ["https://rpc.ankr.com/eth_goerli"],
  // Optional. By default, it will use Aragon's provided endpoints.
  // They will switch depending on the network (production, development)
  ipfsNodes: [
    {
      url: "https://testing-ipfs-0.aragon.network/api/v0",
      headers: { "X-API-KEY": IPFS_API_KEY || "" },
    },
  ],
  // Optional. By default it will use Aragon's provided endpoints.
  // They will switch depending on the network (production, development)
  graphqlNodes: [
    {
      url: "https://subgraph.satsuma-prod.com/aragon/core-goerli/api",
    },
  ],
};

// Bare minimoum context that will use de default values
const minimalContextParams: ContextParams = {
  network: "mainnet",
  web3Providers: "https://eth.llamarpc.com",
  signer: Wallet.createRandom(),
};

// Instantiate the Aragon SDK context
export const context: Context = new Context(contextParams);
// Instantiate the Aragon SDK context
export const minimalContext: Context = new Context(minimalContextParams);

/* MARKDOWN
Update the context with new parameters if you wish to throughout your app.
*/

context.set({ network: 1 });
context.set({ signer: new Wallet("private key") }); // if you're using wagmi library, you can also get the signer through their [`useSigner` method](https://wagmi.sh/react/hooks/useSigner) inside a `useEffect` hook.
context.set(contextParams);
