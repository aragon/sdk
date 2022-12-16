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
        "https://subgraph.satsuma-prod.com/aragon/core-goerli/version/v0.6.3-alpha/api",
    },
  ],
  failing: [{ url: "https://bad-url-gateway.io/" }],
};

export const TEST_WALLET_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
export const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

// Token
export const TEST_TOKEN_VOTING_DAO_ADDRESS = "0xa893a2b4c4372dea2877ecfc0d079676e637985f";
export const TEST_TOKEN_VOTING_PLUGIN_ADDRESS =
  "0x6bafbdb8d8b68ba08cc8c2f6f014b22ce54abfcd";
export const TEST_TOKEN_VOTING_PROPOSAL_ID = TEST_TOKEN_VOTING_PLUGIN_ADDRESS +
  "_0x0";

// Address List
export const TEST_ADDRESSLIST_DAO_ADDDRESS =
  "0x23c020edea8e851157eb997220a534ccac880b57";
export const TEST_ADDRESSLIST_PLUGIN_ADDRESS =
  "0xbefc344eb15e6e6bd18645e2333e0e5ce136b818";
export const TEST_ADDRESSLIST_PROPOSAL_ID = TEST_ADDRESSLIST_PLUGIN_ADDRESS +
  "_0x0";

// Multisig
export const TEST_MULTISIG_DAO_ADDRESS = "0x84432686c0d14f362e0e7c08c780682116d6bc44"
export const TEST_MULTISIG_PLUGIN_ADDRESS =
  "0xfdb81a1be7feae875088d5d9ab7953824ba69adf";
export const TEST_MULTISIG_PROPOSAL_ID = TEST_MULTISIG_PLUGIN_ADDRESS + "_0x0"

export const TEST_DAO_ADDRESS = TEST_TOKEN_VOTING_DAO_ADDRESS;
// TODO FIX
export const TEST_NO_BALANCES_DAO_ADDRESS =
  "0x95acd075a4519edb30d4138d0fafea2d1a1f74e6";
export const TEST_INVALID_ADDRESS = "0x1nv4l1d_4ddr355";
export const TEST_NON_EXISTING_ADDRESS =
  "0x1234567890123456789012345678901234567890";

// TODO
// changue this addresses for a valid one
export const TEST_ADMIN_PROPOSAL_ID =
  "0xf91c316115605780d1a1d6cc7072556af197eaa9_0x0";
export const TEST_ADMIN_ADDRESS = "0xf91c316115605780d1a1d6cc7072556af197eaa9";

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
