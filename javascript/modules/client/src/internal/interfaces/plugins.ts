// This file contains the definitions of the ERC20 and AddressList DAO clients

import { IClientCore } from "./core";
import {
  DaoAction,
  GasFeeEstimation,
  IPagination,
} from "./common";

// NOTE: These 2 clients will eventually be moved to their own package

// ERC20

/** Defines the shape of the ERC20 client class */
export interface IClientErc20 extends IClientCore {
  methods: {
    createProposal: (
      params: ICreateProposal
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (proposalId: string, vote: VoteValues) => AsyncGenerator<VoteProposalStepValue>;
    executeProposal: (proposalId: string) => AsyncGenerator<ExecuteProposalStepValue>;
    getMembers: (addressOrEns: string) => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<Erc20Proposal>
    getProposals: (params?: IProposalQueryParams) => Promise<Erc20ProposalListItem[]>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    setPluginConfigAction: (params: ProposalConfig) => DaoAction;
  };
  estimation: {
    createProposal: (
      params: ICreateProposal
    ) => Promise<GasFeeEstimation>;
    voteProposal: (
      proposalId: string,
      vote: VoteValues
    ) => Promise<GasFeeEstimation>;
    executeProposal: (proposalId: string) => Promise<GasFeeEstimation>;
  };
}

// MULTISIG

/** Defines the shape of the AddressList client class */
export interface IClientAddressList extends IClientCore {
  methods: {
    createProposal: (
      params: ICreateProposal
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (proposalId: string, vote: VoteValues) => AsyncGenerator<VoteProposalStepValue>;
    executeProposal: (proposalId: string) => AsyncGenerator<ExecuteProposalStepValue>;
    getMembers: (addressOrEns: string) => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<AddressListProposal>
    getProposals: (params?: IProposalQueryParams) => Promise<AddressListProposalListItem[]>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    setPluginConfigAction: (params: ProposalConfig) => DaoAction;
  };
  estimation: {
    createProposal: (params: ICreateProposal) => Promise<GasFeeEstimation>;
    voteProposal: (proposalId: string, vote: VoteValues) => Promise<GasFeeEstimation>;
    executeProposal: (proposalId: string) => Promise<GasFeeEstimation>;
  };
}

// TYPES
export interface ProposalConfig {
  /** Float: 0 to 1 */
  minSupport: number;
  /** Float: 0 to 1 */
  minTurnout: number;
  /** In seconds */
  minDuration: number;
}

export interface ICreateProposal {
  metadata: ProposalMetadata;
  actions?: DaoAction[];
  startDate?: Date;
  endDate?: Date;
  executeOnPass?: boolean;
  creatorVote?: VoteValues;
}

// Factory init params

export type IErc20PluginInstall = {
  proposals: ProposalConfig;
  newToken?: NewTokenParams;
  useToken?: ExistingTokenParams;
};

type ExistingTokenParams = {
  address: string;
};

type NewTokenParams = {
  name: string;
  symbol: string;
  decimals: number;
  minter?: string;
  balances: { address: string; balance: bigint }[];
};

export type IAddressListPluginInstall = {
  addresses: string[],
  proposals: ProposalConfig
}

// STEPS

// PROPOSAL CREATION
export enum ProposalCreationSteps {
  CREATING = "creating",
  DONE = "done",
}

export type ProposalCreationStepValue =
  | { key: ProposalCreationSteps.CREATING; txHash: string }
  | { key: ProposalCreationSteps.DONE; proposalId: string };

// PROPOOSAL VOTING
export enum VoteProposalStep {
  VOTING = "voting",
  DONE = "done",
}

export type VoteProposalStepValue =
  | { key: VoteProposalStep.VOTING; txHash: string }
  | { key: VoteProposalStep.DONE; voteId: string };

// PROPOOSAL EXECUTION
export enum ExecuteProposalStep {
  EXECUTING = "executing",
  DONE = "done",
}

export type ExecuteProposalStepValue =
  | { key: ExecuteProposalStep.EXECUTING; txHash: string }
  | { key: ExecuteProposalStep.DONE };


  // PROPOSAL RETRIEVAL

// Long version
export type ProposalBase = {
  id: string
  dao: {
    address: string,
    name: string,
  },
  creatorAddress: string;
  metadata: ProposalMetadata;
  startDate: Date;
  endDate: Date;
  creationDate: Date;
  actions: Array<ProposalAction>;
  status: ProposalStatus;
}

export type Erc20Proposal = ProposalBase & {
  result: Erc20ProposalResult;
  settings: ProposalVotingSettings;
  token: Erc20TokenDetails;
  usedVotingWeight: bigint;
  votes: Array<{ address: string; vote: VoteValues; weight: bigint }>;
}

export type AddressListProposal = ProposalBase & {
  result: AddressListProposalResult;
  settings: ProposalVotingSettings;
  votes: Array<{ address: string; vote: VoteValues; }>;
};

/**
 * Contains the human-readable information about a proposal
 */
 export type ProposalMetadata = {
  title: string;
  summary: string;
  description: string;
  resources: Array<{ url: string; name: string }>;
  media: {
    header?: string;
    logo?: string;
  };
};

/**
 * Contains the human-readable information about a proposal
 */
export type ProposalAction = {
  to: string;
  value: bigint;
  data: Uint8Array;
};


// Short version
export type ProposalListItemBase = {
  id: string;
  dao: {
    address: string;
    name: string;
  },
  creatorAddress: string;
  metadata: ProposalMetadataSummary;
  startDate: Date;
  endDate: Date;
  status: ProposalStatus;
};

export type Erc20ProposalListItem = ProposalListItemBase & {
  token: Erc20TokenDetails;
  result: Erc20ProposalResult;
};

export type AddressListProposalListItem = ProposalListItemBase & {
  result: AddressListProposalResult;
}

/**
 * Contains the human-readable information about a proposal
 */
export type ProposalMetadataSummary = {
  title: string;
  summary: string;
};

/**
 * Contains the statuses of a proposal. Note that on chain
 * proposals cannot be in draft state
 */
export enum ProposalStatus {
  ACTIVE = "Active",
  PENDING = "Pending",
  SUCCEEDED = "Succeeded",
  EXECUTED = "Executed",
  DEFEATED = "Defeated",
}

export enum VoteValues {
  // NONE = 0,
  ABSTAIN = 1,
  YES = 2,
  NO = 3,
};

export type Erc20ProposalResult = {
  yes: bigint;
  no: bigint;
  abstain: bigint;
};

export type AddressListProposalResult = {
  yes: number;
  no: number;
  abstain: number;
};


export type ProposalVotingSettings = {
  minTurnout: number;  // float 0 to 1
  minSupport: number;  // float 0 to 1
  minDuration: number; // in seconds
};

type Erc20TokenDetails = { address: string, name: string; symbol: string; decimals: number; };

export interface IProposalQueryParams extends IPagination {
  sortBy?: ProposalSortBy
  addressOrEns?: string
}

export enum ProposalSortBy {
  CREATED_AT,
  NAME,
  POPULARITY,
  VOTES // currently defined as number of proposals
}
