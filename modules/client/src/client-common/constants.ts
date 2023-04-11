import { activeContractsList } from "@aragon/osx-ethers";
import { NetworkDeployment, SupportedNetworks } from "./interfaces/common";
import { ProposalMetadata } from "./interfaces/plugin";

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

// TODO change rpcs to aragon ones
export const WEB3_NODES: { [K in SupportedNetworks]: string[] } = {
  homestead: ["https://eth.llamarpc.com"],
  goerli: ["https://endpoints.omniatech.io/v1/eth/goerli/public"],
  matic: ["https://polygon.llamarpc.com"],
  maticmum: ["https://endpoints.omniatech.io/v1/matic/mumbai/public"],
};

export const GRAPHQL_NODES: { [K in SupportedNetworks]: { url: string }[] } = {
  homestead: [
    {
      url: "https://subgraph.satsuma-prod.com/" + process.env.SATSUMA_API_KEY ||
        "" + "/aragon/osx-mainnet/api",
    },
  ],
  goerli: [
    {
      url: "https://subgraph.satsuma-prod.com/" + process.env.SATSUMA_API_KEY ||
        "" + "/aragon/osx-goerli/api",
    },
  ],
  matic: [
    {
      url: "https://subgraph.satsuma-prod.com/" + process.env.SATSUMA_API_KEY ||
        "" + "/aragon/osx-polygon/api",
    },
  ],
  maticmum: [
    {
      url: "https://subgraph.satsuma-prod.com/" + process.env.SATSUMA_API_KEY ||
        "" + "/aragon/osx-mumbai/api",
    },
  ],
};

export const IPFS_NODES: {
  [K in SupportedNetworks]: {
    url: string;
    headers?: Record<string, string> | undefined;
  }[];
} = {
  homestead: [
    {
      url: "https://ipfs-0.aragon.network",
      headers: { "X-API-KEY": process.env.IPFS_API_KEY || "" },
    },
    {
      url: "https://ipfs-1.aragon.network",
      headers: { "X-API-KEY": process.env.IPFS_API_KEY || "" },
    },
  ],
  goerli: [
    {
      url: "https://testingipfs-0.aragon.network",
      headers: { "X-API-KEY": process.env.IPFS_API_KEY || "" },
    },
  ],
  matic: [
    {
      url: "https://ipfs-0.aragon.network",
      headers: { "X-API-KEY": process.env.IPFS_API_KEY || "" },
    },
    {
      url: "https://ipfs-1.aragon.network",
      headers: { "X-API-KEY": process.env.IPFS_API_KEY || "" },
    },
  ],
  maticmum: [
    {
      url: "https://testingipfs-0.aragon.network",
      headers: { "X-API-KEY": process.env.IPFS_API_KEY || "" },
    },
  ],
};

export const LIVE_CONTRACTS: { [K in SupportedNetworks]: NetworkDeployment } = {
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
