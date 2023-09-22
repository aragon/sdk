import { activeContractsList } from "@aragon/osx-ethers";
import { activeContractsList as activeContractsListV1_0_0 } from "@aragon/osx-ethers-v1.0.0";
import { ProposalMetadata, SupportedNetwork, SupportedVersion } from "./types";
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

export const LIVE_CONTRACTS: {
  [J in SupportedVersion]: { [K in SupportedNetwork]: NetworkDeployment };
} = {
  [SupportedVersion.V1_0_0]: {
    [SupportedNetwork.MAINNET]: {
      daoFactoryAddress: activeContractsListV1_0_0.mainnet.DAOFactory,
      pluginSetupProcessorAddress:
        activeContractsListV1_0_0.mainnet.PluginRepoFactory,
      multisigRepoAddress: activeContractsListV1_0_0.mainnet["multisig-repo"],
      adminRepoAddress: activeContractsListV1_0_0.mainnet["admin-repo"],
      addresslistVotingRepoAddress:
        activeContractsListV1_0_0.mainnet["address-list-voting-repo"],
      tokenVotingRepoAddress:
        activeContractsListV1_0_0.mainnet["token-voting-repo"],
      multisigSetupAddress: activeContractsListV1_0_0.mainnet.MultisigSetup,
      adminSetupAddress: activeContractsListV1_0_0.mainnet.AdminSetup,
      addresslistVotingSetupAddress:
        activeContractsListV1_0_0.mainnet.AddresslistVotingSetup,
      tokenVotingSetupAddress:
        activeContractsListV1_0_0.mainnet.TokenVotingSetup,
    },
    [SupportedNetwork.GOERLI]: {
      daoFactoryAddress: activeContractsListV1_0_0.goerli.DAOFactory,
      pluginSetupProcessorAddress:
        activeContractsListV1_0_0.goerli.PluginSetupProcessor,
      multisigRepoAddress: activeContractsListV1_0_0.goerli["multisig-repo"],
      adminRepoAddress: activeContractsListV1_0_0.goerli["admin-repo"],
      addresslistVotingRepoAddress:
        activeContractsListV1_0_0.goerli["address-list-voting-repo"],
      tokenVotingRepoAddress:
        activeContractsListV1_0_0.goerli["token-voting-repo"],
      multisigSetupAddress: activeContractsListV1_0_0.goerli.MultisigSetup,
      adminSetupAddress: activeContractsListV1_0_0.goerli.AdminSetup,
      addresslistVotingSetupAddress:
        activeContractsListV1_0_0.goerli.AddresslistVotingSetup,
      tokenVotingSetupAddress:
        activeContractsListV1_0_0.goerli.TokenVotingSetup,
    },
    [SupportedNetwork.POLYGON]: {
      daoFactoryAddress: activeContractsListV1_0_0.polygon.DAOFactory,
      pluginSetupProcessorAddress:
        activeContractsListV1_0_0.polygon.PluginSetupProcessor,
      multisigRepoAddress: activeContractsListV1_0_0.polygon["multisig-repo"],
      adminRepoAddress: activeContractsListV1_0_0.polygon["admin-repo"],
      addresslistVotingRepoAddress:
        activeContractsListV1_0_0.polygon["address-list-voting-repo"],
      tokenVotingRepoAddress:
        activeContractsListV1_0_0.polygon["token-voting-repo"],
      multisigSetupAddress: activeContractsListV1_0_0.polygon.MultisigSetup,
      adminSetupAddress: activeContractsListV1_0_0.polygon.AdminSetup,
      addresslistVotingSetupAddress:
        activeContractsListV1_0_0.polygon.AddresslistVotingSetup,
      tokenVotingSetupAddress:
        activeContractsListV1_0_0.polygon.TokenVotingSetup,
    },
    [SupportedNetwork.MUMBAI]: {
      daoFactoryAddress: activeContractsListV1_0_0.mumbai.DAOFactory,
      pluginSetupProcessorAddress:
        activeContractsListV1_0_0.mumbai.PluginSetupProcessor,
      multisigRepoAddress: activeContractsListV1_0_0.mumbai["multisig-repo"],
      adminRepoAddress: activeContractsListV1_0_0.mumbai["admin-repo"],
      addresslistVotingRepoAddress:
        activeContractsListV1_0_0.mumbai["address-list-voting-repo"],
      tokenVotingRepoAddress:
        activeContractsListV1_0_0.mumbai["token-voting-repo"],
      multisigSetupAddress: activeContractsListV1_0_0.mumbai.MultisigSetup,
      adminSetupAddress: activeContractsListV1_0_0.mumbai.AdminSetup,
      addresslistVotingSetupAddress:
        activeContractsListV1_0_0.mumbai.AddresslistVotingSetup,
      tokenVotingSetupAddress:
        activeContractsListV1_0_0.mumbai.TokenVotingSetup,
    },
    [SupportedNetwork.BASE]: {
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
    },
    [SupportedNetwork.BASE_GOERLI]: {
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
    },
  },
  [SupportedVersion.V1_3_0]: {
    [SupportedNetwork.MAINNET]: {
      daoFactoryAddress: activeContractsList.mainnet.DAOFactory,
      pluginSetupProcessorAddress:
        activeContractsList.mainnet.PluginRepoFactory,
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
    },
    [SupportedNetwork.BASE_GOERLI]: {
      daoFactoryAddress: activeContractsList.baseGoerli.DAOFactory,
      pluginSetupProcessorAddress:
        activeContractsList.baseGoerli.PluginSetupProcessor,
      multisigRepoAddress: activeContractsList.baseGoerli["multisig-repo"],
      adminRepoAddress: activeContractsList.baseGoerli["admin-repo"],
      addresslistVotingRepoAddress:
        activeContractsList.baseGoerli["address-list-voting-repo"],
      tokenVotingRepoAddress:
        activeContractsList.baseGoerli["token-voting-repo"],
      multisigSetupAddress: activeContractsList.baseGoerli.MultisigSetup,
      adminSetupAddress: activeContractsList.baseGoerli.AdminSetup,
      addresslistVotingSetupAddress:
        activeContractsList.baseGoerli.AddresslistVotingSetup,
      tokenVotingSetupAddress: activeContractsList.baseGoerli.TokenVotingSetup,
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
    },
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
