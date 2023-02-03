/* MARKDOWN
## Getting started with the Aragon SDK

The [Context](../../context.ts) class is a utility component that holds the
configuration passed to any [Client](../../client.ts) instance.

In order to gain access to the Aragon SDK, you will want to instantiate it within the context of your application.

You can either call it directly where you use it, or you can set it up in a context hook so you have access to it throughout your application.

*/
// Import the NPM package
import { Context } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { ContextParams } from "@aragon/sdk-client";

// Set up your IPFS API key. You can get one either by running a local node or by using a service like Infura.
// Make sure to always keep these private in a file that is not committed to your repository.
export const IPFS_API_KEY = "ipfs-api-key";

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
      headers: { "X-API-KEY": IPFS_API_KEY || "" },
    },
  ],
  // Don't change this line. This is how we connect your app to the Aragon subgraph.
  graphqlNodes: [
    {
      url:
        "https://subgraph.satsuma-prod.com/aragon/core-goerli/api",
    },
  ],
};

// Instantiate the Aragon SDK context
const context = new Context(contextParams);

// Update the context with new parameters if you wish to throughout your app.
context.set({ network: 1 });
context.set({ signer: new Wallet("private key") }); // if you're using wagmi library, you can also get the signer through their [`useSigner` method](https://wagmi.sh/react/hooks/useSigner) inside a `useEffect` hook.
context.setFull(contextParams);
