import { Wallet } from "@ethersproject/wallet";
import { ContextParams } from "../../src";

const IPFS_API_KEY = process.env.IPFS_API_KEY || "";

export const web3endpoints = {
  working: [
    "https://cloudflare-eth.com/",
  ],
  failing: ["https://bad-url-gateway.io/"],
};

const ipfsEndpoints = {
  working: [
    {
      url: process.env.IPFS_ENDPOINT || "https://ipfs.example.com/",
      headers: {
        "X-API-KEY": IPFS_API_KEY,
      },
    },
    {
      url: "http://localhost:5001",
    },
    {
      url: "http://localhost:5002",
    },
    {
      url: "http://localhost:5003",
    },
  ],
  failing: [
    {
      url: "https://bad-url-gateway.io/",
    },
  ],
};

const grapqhlEndpoints = {
  working: [
    {
      url:
        "https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/core-goerli/api",
    },
  ],
  failing: [{ url: "https://bad-url-gateway.io/" }],
};

export const TEST_WALLET_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
export const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

// Token
export const TEST_TOKEN_VOTING_DAO_ADDRESS =
  "0x968ea45062ca6e5bd3799d8c4e11edc3c754efcc";
export const TEST_TOKEN_VOTING_PLUGIN_ADDRESS =
  "0x8a5188778239bc28adfabcc16187bdd48a60b191";
export const TEST_TOKEN_VOTING_PROPOSAL_ID = TEST_TOKEN_VOTING_PLUGIN_ADDRESS +
  "_0x0";

// Address List
export const TEST_ADDRESSLIST_DAO_ADDDRESS =
  "0x8317b5e06bb8eb2708878a507126af116b2bf74a";
export const TEST_ADDRESSLIST_PLUGIN_ADDRESS =
  "0xeb56564b617b093b60b2d5734481cf400780e37b";
export const TEST_ADDRESSLIST_PROPOSAL_ID = TEST_ADDRESSLIST_PLUGIN_ADDRESS +
  "_0x0";

// Multisig
export const TEST_MULTISIG_DAO_ADDRESS =
  "0x11ce7e748965fa6b0367a98174c8affeaaf5bd0a";
export const TEST_MULTISIG_PLUGIN_ADDRESS =
  "0xbad39bda1f40b613ae9ec5fc2dcccf08c17cdee1";
export const TEST_MULTISIG_PROPOSAL_ID = TEST_MULTISIG_PLUGIN_ADDRESS +
  "_0x0";

export const TEST_DAO_ADDRESS = TEST_TOKEN_VOTING_DAO_ADDRESS;
// TODO FIX
export const TEST_NO_BALANCES_DAO_ADDRESS = TEST_MULTISIG_DAO_ADDRESS;
export const TEST_INVALID_ADDRESS = "0x1nv4l1d_4ddr355";
export const TEST_NON_EXISTING_ADDRESS =
  "0x1234567890123456789012345678901234567890";

export const contextParamsMainnet: ContextParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.working,
  ipfsNodes: ipfsEndpoints.working,
  graphqlNodes: grapqhlEndpoints.working,
};

export const contextParamsLocalChain: ContextParams = {
  network: 31337,
  signer: new Wallet(TEST_WALLET),
  daoFactoryAddress: "0xf8065dD2dAE72D4A8e74D8BB0c8252F3A9acE7f9",
  web3Providers: ["http://localhost:8545"],
  ipfsNodes: ipfsEndpoints.working,
  graphqlNodes: grapqhlEndpoints.working,
};

export const contextParamsFailing: ContextParams = {
  network: "mainnet",
  signer: new Wallet(TEST_WALLET),
  daoFactoryAddress: "0x0123456789012345678901234567890123456789",
  web3Providers: web3endpoints.failing,
  ipfsNodes: ipfsEndpoints.failing,
  graphqlNodes: grapqhlEndpoints.failing,
};
