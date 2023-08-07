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

const getGraphqlNode = (netowrk: SupportedNetwork): string => {
  return `https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-${
    SupportedNetworksToGraphqlNetworks[netowrk]
  }/version/v1.2.2/api`;
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
  [SupportedNetwork.GOERLI]: {
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
  [SupportedNetwork.MUMBAI]: {
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
  [SupportedNetwork.POLYGON]: {
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
  [SupportedNetwork.BASE]: {
    daoFactory: activeContractsList.baseMainnet.DAOFactory,
    pluginSetupProcessor: activeContractsList.baseMainnet.PluginSetupProcessor,
    multisigRepo: activeContractsList.baseMainnet["multisig-repo"],
    adminRepo: activeContractsList.baseMainnet["admin-repo"],
    addresslistVotingRepo:
      activeContractsList.baseMainnet["address-list-voting-repo"],
    tokenVotingRepo: activeContractsList.baseMainnet["token-voting-repo"],
    multisigSetup: activeContractsList.baseMainnet.MultisigSetup,
    adminSetup: activeContractsList.baseMainnet.AdminSetup,
    addresslistVotingSetup:
      activeContractsList.baseMainnet.AddresslistVotingSetup,
    tokenVotingSetup: activeContractsList.baseMainnet.TokenVotingSetup,
    ensRegistry: activeContractsList.baseMainnet.ENSRegistry,
  },
  [SupportedNetwork.BASE_GOERLI]: {
    daoFactory: activeContractsList.baseGoerli.DAOFactory,
    pluginSetupProcessor: activeContractsList.baseGoerli.PluginSetupProcessor,
    multisigRepo: activeContractsList.baseGoerli["multisig-repo"],
    adminRepo: activeContractsList.baseGoerli["admin-repo"],
    addresslistVotingRepo:
      activeContractsList.baseGoerli["address-list-voting-repo"],
    tokenVotingRepo: activeContractsList.baseGoerli["token-voting-repo"],
    multisigSetup: activeContractsList.baseGoerli.MultisigSetup,
    adminSetup: activeContractsList.baseGoerli.AdminSetup,
    addresslistVotingSetup:
      activeContractsList.baseGoerli.AddresslistVotingSetup,
    tokenVotingSetup: activeContractsList.baseGoerli.TokenVotingSetup,
    ensRegistry: activeContractsList.baseGoerli.ENSRegistry,
  },
  [SupportedNetwork.LOCAL]: {
    daoFactory: "",
    pluginSetupProcessor: "",
    multisigRepo: "",
    adminRepo: "",
    addresslistVotingRepo: "",
    tokenVotingRepo: "",
    multisigSetup: "",
    adminSetup: "",
    addresslistVotingSetup: "",
    tokenVotingSetup: "",
    ensRegistry: "",
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
