import { activeContractsList } from "@aragon/osx-ethers";
import { NetworkDeployment, SupportedNetwork } from "./types/common";
import { ProposalMetadata } from "./types/plugin";

export const UNSUPPORTED_PROPOSAL_METADATA_LINK: ProposalMetadata = {
  title: "(unsupported metadata link)",
  summary: "(the link to the metadata is not supported)",
  description: "(the link to the metadata is not supported)",
  resources: [],
};
export const EMPTY_PROPOSAL_METADATA_LINK: ProposalMetadata = {
  title: "(the proposal has no metadata)",
  summary: "(the current proposal does not have any content defined)",
  description: "(the current proposal does not have any content defined)",
  resources: [],
};
export const UNAVAILABLE_PROPOSAL_METADATA: ProposalMetadata = {
  title: "(unavailable metadata)",
  summary: "(the proposal metadata is not available)",
  description: "(the proposal metadata is not available)",
  resources: [],
};

const getGraphqlNode = (netowrk: SupportedNetwork): string => {
  return `https://subgraph.satsuma-prod.com/${
    process?.env?.SATSUMA_API_KEY || "qHR2wGfc5RLi6"
  }/aragon/osx-${SupportedNetworksToGraphqlNetworks[netowrk]}/api`;
};

type GraphqlNetworks = "mainnet" | "goerli" | "polygon" | "mumbai";

const SupportedNetworksToGraphqlNetworks: {
  [K in SupportedNetwork]: GraphqlNetworks;
} = {
  homestead: "mainnet",
  goerli: "goerli",
  matic: "polygon",
  maticmum: "mumbai",
};

export const GRAPHQL_NODES: { [K in SupportedNetwork]: { url: string }[] } = {
  homestead: [{ url: getGraphqlNode("homestead") }],
  goerli: [{ url: getGraphqlNode("goerli") }],
  matic: [{ url: getGraphqlNode("matic") }],
  maticmum: [{ url: getGraphqlNode("maticmum") }],
};

const IPFS_ENDPOINTS = {
  prod: [
    {
      url: "https://ipfs-0.aragon.network",
      headers: {
        "X-API-KEY": process?.env?.IPFS_API_KEY ||
          "b477RhECf8s8sdM7XrkLBs2wHc4kCMwpbcFC55Kt",
      },
    },
    {
      url: "https://ipfs-1.aragon.network",
      headers: {
        "X-API-KEY": process?.env?.IPFS_API_KEY ||
          "b477RhECf8s8sdM7XrkLBs2wHc4kCMwpbcFC55Kt",
      },
    },
  ],
  test: [
    {
      url: "https://testing-ipfs-0.aragon.network",
      headers: {
        "X-API-KEY": process?.env?.IPFS_TEST_API_KEY ||
          "b477RhECf8s8sdM7XrkLBs2wHc4kCMwpbcFC55Kt",
      },
    },
  ],
};

export const IPFS_NODES: {
  [K in SupportedNetwork]: {
    url: string;
    headers?: Record<string, string> | undefined;
  }[];
} = {
  homestead: IPFS_ENDPOINTS.prod,
  goerli: IPFS_ENDPOINTS.test,
  matic: IPFS_ENDPOINTS.prod,
  maticmum: IPFS_ENDPOINTS.test,
};

export const LIVE_CONTRACTS: { [K in SupportedNetwork]: NetworkDeployment } = {
  homestead: {
    daoFactory: activeContractsList.mainnet.DAOFactory,
    pluginSetupProcessor: activeContractsList.mainnet.PluginRepoFactory,
    multisigRepo: activeContractsList.mainnet["multisig-repo"],
    adminRepo: activeContractsList.mainnet["admin-repo"],
    addresslistVotingRepo:
      activeContractsList.mainnet["address-list-voting-repo"],
    tokenVotingRepo: activeContractsList.mainnet["token-voting-repo"],
    multisigSetup: activeContractsList.mainnet.MultisigSetup,
    adminSetup: activeContractsList.mainnet.AdminSetup,
    addresslistVotingSetup: activeContractsList.mainnet.AddresslistVotingSetup,
    tokenVotingSetup: activeContractsList.mainnet.TokenVotingSetup,
  },
  goerli: {
    daoFactory: activeContractsList.goerli.DAOFactory,
    pluginSetupProcessor: activeContractsList.goerli.PluginSetupProcessor,
    multisigRepo: activeContractsList.goerli["multisig-repo"],
    adminRepo: activeContractsList.goerli["admin-repo"],
    addresslistVotingRepo:
      activeContractsList.goerli["address-list-voting-repo"],
    tokenVotingRepo: activeContractsList.goerli["token-voting-repo"],
    multisigSetup: activeContractsList.goerli.MultisigSetup,
    adminSetup: activeContractsList.goerli.AdminSetup,
    addresslistVotingSetup: activeContractsList.goerli.AddresslistVotingSetup,
    tokenVotingSetup: activeContractsList.goerli.TokenVotingSetup,
  },
  maticmum: {
    daoFactory: activeContractsList.mumbai.DAOFactory,
    pluginSetupProcessor: activeContractsList.mumbai.PluginSetupProcessor,
    multisigRepo: activeContractsList.mumbai["multisig-repo"],
    adminRepo: activeContractsList.mumbai["admin-repo"],
    addresslistVotingRepo:
      activeContractsList.mumbai["address-list-voting-repo"],
    tokenVotingRepo: activeContractsList.mumbai["token-voting-repo"],
    multisigSetup: activeContractsList.mumbai.MultisigSetup,
    adminSetup: activeContractsList.mumbai.AdminSetup,
    addresslistVotingSetup: activeContractsList.mumbai.AddresslistVotingSetup,
    tokenVotingSetup: activeContractsList.mumbai.TokenVotingSetup,
    ensRegistry: activeContractsList.mumbai.ENSRegistry,
  },
  matic: {
    daoFactory: activeContractsList.polygon.DAOFactory,
    pluginSetupProcessor: activeContractsList.polygon.PluginSetupProcessor,
    multisigRepo: activeContractsList.polygon["multisig-repo"],
    adminRepo: activeContractsList.polygon["admin-repo"],
    addresslistVotingRepo:
      activeContractsList.polygon["address-list-voting-repo"],
    tokenVotingRepo: activeContractsList.polygon["token-voting-repo"],
    multisigSetup: activeContractsList.polygon.MultisigSetup,
    adminSetup: activeContractsList.polygon.AdminSetup,
    addresslistVotingSetup: activeContractsList.polygon.AddresslistVotingSetup,
    tokenVotingSetup: activeContractsList.polygon.TokenVotingSetup,
    ensRegistry: activeContractsList.polygon.ENSRegistry,
  },
};
