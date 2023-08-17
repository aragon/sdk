import { activeContractsList } from "@aragon/osx-ethers";
import { ProposalMetadata, SupportedNetwork } from "./types";
import { NetworkDeployment } from "./internal";
import { Network } from "@ethersproject/networks";

/** Timeout that will be applied to operations involving
 * many fetch requests that could take a long time */
export const MULTI_FETCH_TIMEOUT = 7 * 1000;

type GraphqlNetworks =
  | "mainnet"
  | "goerli"
  | "polygon"
  | "mumbai"
  | "baseGoerli"
  | "baseMainnet"
  | "local";

const SupportedNetworksToGraphqlNetworks: {
  [K in SupportedNetwork]: GraphqlNetworks;
} = {
  [SupportedNetwork.MAINNET]: "mainnet",
  [SupportedNetwork.GOERLI]: "goerli",
  [SupportedNetwork.POLYGON]: "polygon",
  [SupportedNetwork.MUMBAI]: "mumbai",
  [SupportedNetwork.BASE_GOERLI]: "baseGoerli",
  [SupportedNetwork.BASE]: "baseMainnet",
  [SupportedNetwork.LOCAL]: "local",
};

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

const getGraphqlNode = (network: SupportedNetwork): string => {
  return `https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-${
    SupportedNetworksToGraphqlNetworks[network]
  }/version/v1.3.0/api`;
};

export const GRAPHQL_NODES: { [K in SupportedNetwork]: { url: string }[] } = {
  [SupportedNetwork.MAINNET]: [{
    url: getGraphqlNode(SupportedNetwork.MAINNET),
  }],
  [SupportedNetwork.GOERLI]: [{ url: getGraphqlNode(SupportedNetwork.GOERLI) }],
  [SupportedNetwork.POLYGON]: [{
    url: getGraphqlNode(SupportedNetwork.POLYGON),
  }],
  [SupportedNetwork.MUMBAI]: [{ url: getGraphqlNode(SupportedNetwork.MUMBAI) }],
  [SupportedNetwork.BASE]: [{ url: getGraphqlNode(SupportedNetwork.BASE) }],
  [SupportedNetwork.BASE_GOERLI]: [{
    url: getGraphqlNode(SupportedNetwork.BASE_GOERLI),
  }],
  [SupportedNetwork.LOCAL]: [{ url: getGraphqlNode(SupportedNetwork.LOCAL) }],
};

const IPFS_ENDPOINTS = {
  prod: [
    {
      url: "https://prod.ipfs.aragon.network/api/v0",
      headers: {
        "X-API-KEY": "b477RhECf8s8sdM7XrkLBs2wHc4kCMwpbcFC55Kt",
      },
    },
  ],
  test: [
    {
      url: "https://test.ipfs.aragon.network/api/v0",
      headers: {
        "X-API-KEY": "b477RhECf8s8sdM7XrkLBs2wHc4kCMwpbcFC55Kt",
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
  [SupportedNetwork.MAINNET]: IPFS_ENDPOINTS.prod,
  [SupportedNetwork.GOERLI]: IPFS_ENDPOINTS.test,
  [SupportedNetwork.POLYGON]: IPFS_ENDPOINTS.prod,
  [SupportedNetwork.MUMBAI]: IPFS_ENDPOINTS.test,
  [SupportedNetwork.BASE]: IPFS_ENDPOINTS.prod,
  [SupportedNetwork.BASE_GOERLI]: IPFS_ENDPOINTS.test,
  [SupportedNetwork.LOCAL]: IPFS_ENDPOINTS.test,
};

export const LIVE_CONTRACTS: { [K in SupportedNetwork]: NetworkDeployment } = {
  [SupportedNetwork.MAINNET]: {
    daoFactoryAddress: activeContractsList.mainnet.DAOFactory,
    pluginSetupProcessorAddress: activeContractsList.mainnet.PluginRepoFactory,
    multisigRepoAddress: activeContractsList.mainnet["multisig-repo"],
    adminRepoAddress: activeContractsList.mainnet["admin-repo"],
    addresslistVotingRepoAddress:
      activeContractsList.mainnet["address-list-voting-repo"],
    tokenVotingRepoAddress: activeContractsList.mainnet["token-voting-repo"],
    multisigSetupAddress: activeContractsList.mainnet.MultisigSetup,
    adminSetupAddress: activeContractsList.mainnet.AdminSetup,
    addresslistVotingSetupAddress:
      activeContractsList.mainnet.AddresslistVotingSetup,
    tokenVotingSetupAddress: activeContractsList.mainnet.TokenVotingSetup,
  },
  [SupportedNetwork.GOERLI]: {
    daoFactoryAddress: activeContractsList.goerli.DAOFactory,
    pluginSetupProcessorAddress:
      activeContractsList.goerli.PluginSetupProcessor,
    multisigRepoAddress: activeContractsList.goerli["multisig-repo"],
    adminRepoAddress: activeContractsList.goerli["admin-repo"],
    addresslistVotingRepoAddress:
      activeContractsList.goerli["address-list-voting-repo"],
    tokenVotingRepoAddress: activeContractsList.goerli["token-voting-repo"],
    multisigSetupAddress: activeContractsList.goerli.MultisigSetup,
    adminSetupAddress: activeContractsList.goerli.AdminSetup,
    addresslistVotingSetupAddress:
      activeContractsList.goerli.AddresslistVotingSetup,
    tokenVotingSetupAddress: activeContractsList.goerli.TokenVotingSetup,
  },
  [SupportedNetwork.MUMBAI]: {
    daoFactoryAddress: activeContractsList.mumbai.DAOFactory,
    pluginSetupProcessorAddress:
      activeContractsList.mumbai.PluginSetupProcessor,
    multisigRepoAddress: activeContractsList.mumbai["multisig-repo"],
    adminRepoAddress: activeContractsList.mumbai["admin-repo"],
    addresslistVotingRepoAddress:
      activeContractsList.mumbai["address-list-voting-repo"],
    tokenVotingRepoAddress: activeContractsList.mumbai["token-voting-repo"],
    multisigSetupAddress: activeContractsList.mumbai.MultisigSetup,
    adminSetupAddress: activeContractsList.mumbai.AdminSetup,
    addresslistVotingSetupAddress:
      activeContractsList.mumbai.AddresslistVotingSetup,
    tokenVotingSetupAddress: activeContractsList.mumbai.TokenVotingSetup,
    ensRegistryAddress: activeContractsList.mumbai.ENSRegistry,
  },
  [SupportedNetwork.POLYGON]: {
    daoFactoryAddress: activeContractsList.polygon.DAOFactory,
    pluginSetupProcessorAddress:
      activeContractsList.polygon.PluginSetupProcessor,
    multisigRepoAddress: activeContractsList.polygon["multisig-repo"],
    adminRepoAddress: activeContractsList.polygon["admin-repo"],
    addresslistVotingRepoAddress:
      activeContractsList.polygon["address-list-voting-repo"],
    tokenVotingRepoAddress: activeContractsList.polygon["token-voting-repo"],
    multisigSetupAddress: activeContractsList.polygon.MultisigSetup,
    adminSetupAddress: activeContractsList.polygon.AdminSetup,
    addresslistVotingSetupAddress:
      activeContractsList.polygon.AddresslistVotingSetup,
    tokenVotingSetupAddress: activeContractsList.polygon.TokenVotingSetup,
    ensRegistryAddress: activeContractsList.polygon.ENSRegistry,
  },
  [SupportedNetwork.BASE]: {
    daoFactoryAddress: activeContractsList.baseMainnet.DAOFactory,
    pluginSetupProcessorAddress:
      activeContractsList.baseMainnet.PluginSetupProcessor,
    multisigRepoAddress: activeContractsList.baseMainnet["multisig-repo"],
    adminRepoAddress: activeContractsList.baseMainnet["admin-repo"],
    addresslistVotingRepoAddress:
      activeContractsList.baseMainnet["address-list-voting-repo"],
    tokenVotingRepoAddress:
      activeContractsList.baseMainnet["token-voting-repo"],
    multisigSetupAddress: activeContractsList.baseMainnet.MultisigSetup,
    adminSetupAddress: activeContractsList.baseMainnet.AdminSetup,
    addresslistVotingSetupAddress:
      activeContractsList.baseMainnet.AddresslistVotingSetup,
    tokenVotingSetupAddress: activeContractsList.baseMainnet.TokenVotingSetup,
    ensRegistryAddress: activeContractsList.baseMainnet.ENSRegistry,
  },
  [SupportedNetwork.BASE_GOERLI]: {
    daoFactoryAddress: activeContractsList.baseGoerli.DAOFactory,
    pluginSetupProcessorAddress:
      activeContractsList.baseGoerli.PluginSetupProcessor,
    multisigRepoAddress: activeContractsList.baseGoerli["multisig-repo"],
    adminRepoAddress: activeContractsList.baseGoerli["admin-repo"],
    addresslistVotingRepoAddress:
      activeContractsList.baseGoerli["address-list-voting-repo"],
    tokenVotingRepoAddress: activeContractsList.baseGoerli["token-voting-repo"],
    multisigSetupAddress: activeContractsList.baseGoerli.MultisigSetup,
    adminSetupAddress: activeContractsList.baseGoerli.AdminSetup,
    addresslistVotingSetupAddress:
      activeContractsList.baseGoerli.AddresslistVotingSetup,
    tokenVotingSetupAddress: activeContractsList.baseGoerli.TokenVotingSetup,
    ensRegistryAddress: activeContractsList.baseGoerli.ENSRegistry,
  },
  [SupportedNetwork.LOCAL]: {
    daoFactoryAddress: "",
    pluginSetupProcessorAddress: "",
    multisigRepoAddress: "",
    adminRepoAddress: "",
    addresslistVotingRepoAddress: "",
    tokenVotingRepoAddress: "",
    multisigSetupAddress: "",
    adminSetupAddress: "",
    addresslistVotingSetupAddress: "",
    tokenVotingSetupAddress: "",
    ensRegistryAddress: "",
  },
};
export const ADDITIONAL_NETWORKS: Network[] = [
  {
    name: "baseGoerli",
    chainId: 84531,
  },
  {
    name: "base",
    chainId: 8453,
  },
  {
    name: "local",
    chainId: 31337,
  },
];
