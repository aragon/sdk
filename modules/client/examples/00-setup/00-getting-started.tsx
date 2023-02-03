/* MARKDOWN
# Getting Started with the aragonOSx SDK

## Before you begin

The aragonOSx SDK is Javascript agnostic, which means you can use it with any Javascript framework, including popular ones like React, Vite, or Vue.

However, keep in mind that because server-side rendering is not supported yet in some crypto packages, you will not be able to use a framework like NextJS. Only frameworks that run entirely on client-side are supported.

Also know that all documentation within this site is done with Typescript. You can read more about [Typescript here](https://www.typescriptlang.org/).

## Installing the SDK

First thing you want to do is install the aragonOSx SDK into your product. You can do this by using `npm` or `yarn`.

```bash
npm i @aragon/sdk-client
```
or
```bash
yarn add @aragon/sdk-client
```

## Setting up the context

Then, you'll want to set up the aragonOSx context within your application to have access to the SDK. You can do this at any point within your app.

However, so you're not setting it up multiple times, we recommend you set it up in the `context` folder of your Javascript application if you're using a framework like React, Vue, or other.

*/

import { Context } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { ContextParams } from "@aragon/sdk-client";

// Set up your IPFS API key. You can get one either by running a local node or by using a service like Infura or Alechmy.
// Make sure to always keep these private in a file that is not committed to your public repository.
export const IPFS_API_KEY: string = "ipfs-api-key";

export const contextParams: ContextParams = {
  network: "mainnet",
  // Depending on how you're congiguring your wallet, you may need to pass in a `signer` object here.
  signer: new Wallet("private-key"),
  // Optional on "rinkeby", "arbitrum-rinkeby" or "mumbai"
  // you can get the `daoFactoryAddress` from here based on the chain you want to use: https://github.com/aragon/core/blob/develop/active_contracts.json
  daoFactoryAddress: "0x1234...",
  // Choose your Web3 provider of choice: Cloudfare, Infura, Alchemy, etc.
  web3Providers: ["https://rpc.ankr.com/eth_goerli"],
  ipfsNodes: [
    {
      url: "https://testing-ipfs-0.aragon.network/api/v0",
      headers: { "X-API-KEY": IPFS_API_KEY || "" }
    },
  ],
  // Don't change this line. This is how we connect your app to the Aragon subgraph.
  graphqlNodes: [
    {
      url:
        "https://subgraph.satsuma-prod.com/aragon/core-goerli/api"
    }
  ]
};

// Instantiate the Aragon SDK context
export const context: Context = new Context(contextParams);

/* MARKDOWN
Update the context with new parameters if you wish to throughout your app.

```tsx
context.set({ network: 1 });
context.set({ signer: new Wallet("private key") }); // if you're using wagmi library, you can also get the signer through their [`useSigner` method](https://wagmi.sh/react/hooks/useSigner) inside a `useEffect` hook.
context.setFull(contextParams);
```
*/

