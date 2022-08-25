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
      params: ICreateProposalParams
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (params: IVoteProposalParams) => AsyncGenerator<VoteProposalStepValue>;
    executeProposal: (params: IExecuteProposalParams) => AsyncGenerator<ExecuteProposalStepValue>;
    getMembers: (addressOrEns: string) => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<Erc20Proposal>
    getProposals: (params?: IProposalQueryParams) => Promise<Erc20ProposalListItem[]>
    getSettings: (pluginAddress: string) => Promise<IPluginSettings>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    updatePluginSettingsAction: (params: IPluginSettings) => DaoAction;
  };
  decoding: {
    updatePluginSettingsAction: (data: Uint8Array) => IPluginSettings
  };
  estimation: {
    createProposal: (
      params: ICreateProposalParams
    ) => Promise<GasFeeEstimation>;
    voteProposal: (params: IVoteProposalParams) => Promise<GasFeeEstimation>;
    executeProposal: (params: IExecuteProposalParams) => Promise<GasFeeEstimation>;
  };
}

// Address List

/** Defines the shape of the AddressList client class */
export interface IClientAddressList extends IClientCore {
  methods: {
    createProposal: (
      params: ICreateProposalParams
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (params: IVoteProposalParams) => AsyncGenerator<VoteProposalStepValue>;
    executeProposal: (params: IExecuteProposalParams) => AsyncGenerator<ExecuteProposalStepValue>;
    getMembers: (addressOrEns: string) => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<AddressListProposal>
    getProposals: (params?: IProposalQueryParams) => Promise<AddressListProposalListItem[]>
    getSettings: (pluginAddress: string) => Promise<IPluginSettings>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    updatePluginSettingsAction: (params: IPluginSettings) => DaoAction;
  };
  decoding: {
    updatePluginSettingsAction: (data: Uint8Array) => IPluginSettings
  };
  estimation: {
    createProposal: (params: ICreateProposalParams) => Promise<GasFeeEstimation>;
    voteProposal: (params: IVoteProposalParams) => Promise<GasFeeEstimation>;
    executeProposal: (params: IExecuteProposalParams) => Promise<GasFeeEstimation>;
  };
}

// TYPES
export interface IProposalSettings {
  /** Float: 0 to 1 */
  minSupport: number;
  /** Float: 0 to 1 */
  minTurnout: number;
  /** In seconds */
  duration: number;
}

export interface IPluginSettings {
  /** Float: 0 to 1 */
  minSupport: number;
  /** Float: 0 to 1 */
  minTurnout: number;
  /** In seconds */
  minDuration: number;
}

export interface ICreateProposalParams {
  pluginAddress: string
  metadata: ProposalMetadata;
  actions?: DaoAction[];
  startDate?: Date;
  endDate?: Date;
  executeOnPass?: boolean;
  creatorVote?: VoteValues;
}
export interface IVoteProposalParams {
  pluginAddress: string
  vote: VoteValues;
  proposalId: string;
}
export interface IExecuteProposalParams {
  pluginAddress: string
  proposalId: string;
}

// Factory init params

export type IErc20PluginInstall = {
  settings: IPluginSettings;
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
  settings: IPluginSettings
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
  actions: Array<DaoAction>;
  status: ProposalStatus;
}

export type Erc20Proposal = ProposalBase & {
  result: Erc20ProposalResult;
  settings: IProposalSettings;
  token: Erc20TokenDetails;
  usedVotingWeight: bigint;
  votes: Array<{ address: string; vote: VoteValues; weight: bigint }>;
}

export type AddressListProposal = ProposalBase & {
  result: AddressListProposalResult;
  settings: IProposalSettings;
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
  media?: {
    header?: string;
    logo?: string;
  };
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
