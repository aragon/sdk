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
        "https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/core-goerli/version/v0.7.1-alpha/api",
    },
  ],
  failing: [{ url: "https://bad-url-gateway.io/" }],
};

export const TEST_WALLET_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
export const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

// Token
export const TEST_TOKEN_VOTING_DAO_ADDRESS =
  "0xa1f85ddcf03ee9ac3eb3db66c0e056555a27b264";
export const TEST_TOKEN_VOTING_PLUGIN_ADDRESS =
  "0x3b3ecc3007eb3cb29055d016259cb1e4399816e7";
export const TEST_TOKEN_VOTING_PROPOSAL_ID = TEST_TOKEN_VOTING_PLUGIN_ADDRESS +
  "_0x0";

// Address List
export const TEST_ADDRESSLIST_DAO_ADDDRESS =
  "0xe263986b1c7984b4add5278bb331a40718d1d6ee";
export const TEST_ADDRESSLIST_PLUGIN_ADDRESS =
  "0x0e58ac69de79403a4ba8a378bda0e0225f89153a";
export const TEST_ADDRESSLIST_PROPOSAL_ID = TEST_ADDRESSLIST_PLUGIN_ADDRESS +
  "_0x0";

// Multisig
export const TEST_MULTISIG_DAO_ADDRESS =
  "0x1fc6bf066b5ce34a205db03dcd1abbfb509a5041";
export const TEST_MULTISIG_PLUGIN_ADDRESS =
  "0x7c2a3fea43bc12f6b53e75e6d42ecc232becb031";
export const TEST_MULTISIG_PROPOSAL_ID = TEST_MULTISIG_PLUGIN_ADDRESS + "_0x0";

export const TEST_DAO_ADDRESS = TEST_TOKEN_VOTING_DAO_ADDRESS;
// TODO FIX
export const TEST_NO_BALANCES_DAO_ADDRESS =
  "0x95acd075a4519edb30d4138d0fafea2d1a1f74e6";
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
