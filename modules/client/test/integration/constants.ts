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
        "https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/version/v1.0.0/api",
    },
  ],
  failing: [{ url: "https://bad-url-gateway.io/" }],
};

export const ADDRESS_ONE = '0x0000000000000000000000000000000000000001'
export const ADDRESS_TWO = '0x0000000000000000000000000000000000000002'
export const ADDRESS_THREE = '0x0000000000000000000000000000000000000003'

export const TEST_WALLET_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
export const TEST_WALLET =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

// Token
export const TEST_TOKEN_VOTING_DAO_ADDRESS =
  "0x74f8e7420fbca2d97419717e61a199d0e9bea16a";
export const TEST_TOKEN_VOTING_PLUGIN_ADDRESS =
  "0x5b15e20bc7fe70016b04592201d051e9b7c451f6";
export const TEST_TOKEN_VOTING_PROPOSAL_ID = TEST_TOKEN_VOTING_PLUGIN_ADDRESS +
  "_0x0";

// Address List
export const TEST_ADDRESSLIST_DAO_ADDDRESS =
  "0x81d71ec957ce5a9b08d52bc1507c90e165c93ffd";
export const TEST_ADDRESSLIST_PLUGIN_ADDRESS =
  "0x9c3b91ed3bc54ec97d1650da9d9c6bc57a3f83cc";
export const TEST_ADDRESSLIST_PROPOSAL_ID = TEST_ADDRESSLIST_PLUGIN_ADDRESS +
  "_0x0";

// Multisig
export const TEST_MULTISIG_DAO_ADDRESS =
  "0x335f9ca91d1ed633154a0bc01a800db857d40633";
export const TEST_MULTISIG_PLUGIN_ADDRESS =
  "0x4f43496d3f82f9189505e80cf3f83b09af4b69b1";
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

export const TEST_TX_HASH = '0x0000000000000000000000000000000000000000000000000000000000007E47'
export const IPFS_CID = 'QmQPeNsJPyVWPFDVHb77w8G42Fvo15z4bG2X8D2GhfbSXc'