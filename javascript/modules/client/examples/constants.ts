import { Wallet } from "@ethersproject/wallet";
import { ContextParams } from "@aragon/sdk-client";


export const IPFS_API_KEY = "ipfs-api-key";

export const contextParams: ContextParams = {
  network: "mainnet",
  signer: new Wallet("privateKey"),
  // Optional on "rinkeby", "arbitrum-rinkeby" or "mumbai"
  daoFactoryAddress: "0x1234...",
  web3Providers: ["https://cloudflare-eth.com/"],
  ipfsNodes: [
    {
      url: "https://testing-ipfs-0.aragon.network/api/v0",
      headers: { "X-API-KEY": IPFS_API_KEY || "" },
    },
  ],
  graphqlNodes: [
    {
      url:
        "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby",
    },
  ],
};