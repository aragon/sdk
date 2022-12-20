import { Wallet } from "@ethersproject/wallet";
import { ContextParams } from "../../src";

const IPFS_API_KEY = process.env.IPFS_API_KEY || "";

export const web3endpoints = {
  working: [
    "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
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
        "https://subgraph.satsuma-prod.com/aragon/core-goerli/version/v0.5.0-alpha/api",
    },
  ],
  failing: [{ url: "https://bad-url-gateway.io/" }],
};

export const TEST_WALLET_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
export const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

// Token
export const TEST_TOKEN_VOTING_DAO_ADDRESS =
  "0x7dd41e356b9f9c6e71593cc654a78b445217b06d";
export const TEST_TOKEN_VOTING_PLUGIN_ADDRESS =
  "0x85eccd548378412bac8b08fe934bbb601e2d543e";
export const TEST_TOKEN_VOTING_PROPOSAL_ID = TEST_TOKEN_VOTING_PLUGIN_ADDRESS +
  "_0x0";

// Address List
export const TEST_ADDRESSLIST_DAO_ADDDRESS =
  "0x3877319b1363a1b6451060aa27b6de31b97715fb";
export const TEST_ADDRESSLIST_PLUGIN_ADDRESS =
  "0xf533c1a458a04c57c3cac443e67b0e09bc6675c4";
export const TEST_ADDRESSLIST_PROPOSAL_ID = TEST_ADDRESSLIST_PLUGIN_ADDRESS +
  "_0x0";

// Multisig
export const TEST_MULTISIG_PLUGIN_ADDRESS =
  "0x1234567890123456789012345678901234567890";


export const TEST_DAO_ADDRESS = TEST_TOKEN_VOTING_DAO_ADDRESS;
// TODO FIX
export const TEST_NO_BALANCES_DAO_ADDRESS =
  "0x600bbcbb47990a4e243041cc45b6c0057ff7eba1";
export const TEST_INVALID_ADDRESS = "0x1nv4l1d_4ddr355";
export const TEST_NON_EXISTING_ADDRESS =
  "0x1234567890123456789012345678901234567890";

export const contextParams: ContextParams = {
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
