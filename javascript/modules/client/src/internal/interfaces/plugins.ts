// This file contains the definitions of the ERC20 and AddressList DAO clients

import { IClientCore } from "./core";
import {
  DaoAction,
  GasFeeEstimation,
  IInterfaceParams,
  IPagination,
} from "./common";
import { BigNumber } from "@ethersproject/bignumber";

// NOTE: These 2 clients will eventually be moved to their own package

// ERC20

export interface IClientErc20Methods extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => AsyncGenerator<ProposalCreationStepValue>;
  voteProposal: (
    params: IVoteProposalParams,
  ) => AsyncGenerator<VoteProposalStepValue>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  canVote: (params: ICanVoteParams) => Promise<boolean>;
  getMembers: (addressOrEns: string) => Promise<string[]>;
  getProposal: (propoosalId: string) => Promise<Erc20Proposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<Erc20ProposalListItem[]>;
  getSettings: (pluginAddress: string) => Promise<IPluginSettings | null>;
  getToken: (pluginAddress: string) => Promise<Erc20TokenDetails | null>;
}

export interface IClientErc20Encoding extends IClientCore {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: IPluginSettings,
  ) => DaoAction;
  mintTokenAction: (
    minterAddress: string,
    params: IMintTokenParams,
  ) => DaoAction;
}
export interface IClientErc20Decoding extends IClientCore {
  updatePluginSettingsAction: (data: Uint8Array) => IPluginSettings;
  mintTokenAction: (data: Uint8Array) => IMintTokenParams;
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
}
export interface IClientErc20Estimation extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => Promise<GasFeeEstimation>;
  voteProposal: (params: IVoteProposalParams) => Promise<GasFeeEstimation>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => Promise<GasFeeEstimation>;
}

/** Defines the shape of the ERC20 client class */
export interface IClientErc20 {
  methods: IClientErc20Methods;
  encoding: IClientErc20Encoding;
  decoding: IClientErc20Decoding;
  estimation: IClientErc20Estimation;
}
// Address List

export interface IClientAddressListMethods extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => AsyncGenerator<ProposalCreationStepValue>;
  voteProposal: (
    params: IVoteProposalParams,
  ) => AsyncGenerator<VoteProposalStepValue>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  canVote: (params: ICanVoteParams) => Promise<boolean>;
  getMembers: (addressOrEns: string) => Promise<string[]>;
  getProposal: (propoosalId: string) => Promise<AddressListProposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<AddressListProposalListItem[]>;
  getSettings: (pluginAddress: string) => Promise<IPluginSettings | null>;
}

export interface IClientAddressListEncoding extends IClientCore {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: IPluginSettings,
  ) => DaoAction;
  addMembersAction: (
    pluginAddress: string,
    members: string[],
  ) => DaoAction;
  removeMembersAction: (
    pluginAddress: string,
    members: string[],
  ) => DaoAction;
}
export interface IClientAddressListDecoding extends IClientCore {
  updatePluginSettingsAction: (data: Uint8Array) => IPluginSettings;
  addMembersAction: (data: Uint8Array) => string[];
  removeMembersAction: (data: Uint8Array) => string[];
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
}
export interface IClientAddressListEstimation extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => Promise<GasFeeEstimation>;
  voteProposal: (params: IVoteProposalParams) => Promise<GasFeeEstimation>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => Promise<GasFeeEstimation>;
}
/** Defines the shape of the AddressList client class */
export interface IClientAddressList {
  methods: IClientAddressListMethods;
  encoding: IClientAddressListEncoding;
  decoding: IClientAddressListDecoding;
  estimation: IClientAddressListEstimation;
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
  pluginAddress: string;
  metadata: ProposalMetadata;
  actions?: DaoAction[];
  startDate?: Date;
  endDate?: Date;
  executeOnPass?: boolean;
  creatorVote?: VoteValues;
}
export interface IVoteProposalParams {
  pluginAddress: string;
  vote: VoteValues;
  proposalId: string;
}
export interface IExecuteProposalParams {
  pluginAddress: string;
  proposalId: string;
}

export interface ICanVoteParams {
  pluginAddress: string;
  proposalId: string;
  address: string;
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
  addresses: string[];
  settings: IPluginSettings;
};

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
  id: string;
  dao: {
    address: string;
    name: string;
  };
  creatorAddress: string;
  metadata: ProposalMetadata;
  startDate: Date;
  endDate: Date;
  creationDate: Date;
  actions: Array<DaoAction>;
  status: ProposalStatus;
};

export type Erc20Proposal = ProposalBase & {
  result: Erc20ProposalResult;
  settings: IProposalSettings;
  token: Erc20TokenDetails;
  usedVotingWeight: bigint;
  votes: Array<{ address: string; vote: VoteValues; weight: bigint }>;
  totalVotingWeight: bigint;
};

export type AddressListProposal = ProposalBase & {
  result: AddressListProposalResult;
  settings: IProposalSettings;
  votes: Array<{ address: string; vote: VoteValues }>;
  totalVotingWeight: number;
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
  };
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
};

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
}

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

export type Erc20TokenDetails = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

export interface IProposalQueryParams extends IPagination {
  sortBy?: ProposalSortBy;
  status?: ProposalStatus;
  daoAddressOrEns?: string;
}

export enum ProposalSortBy {
  CREATED_AT = "createdAt",
  NAME = "name",
  POPULARITY = "popularity",
  VOTES = "votes", // currently defined as number of proposals
}

export enum SubgraphVoteValues {
  YES = "Yes",
  NO = "No",
  ABSTAIN = "Abstain",
}
export const SubgraphVoteValuesMap: Map<
  SubgraphVoteValues,
  VoteValues
> = new Map([
  [SubgraphVoteValues.YES, VoteValues.YES],
  [SubgraphVoteValues.NO, VoteValues.NO],
  [SubgraphVoteValues.ABSTAIN, VoteValues.ABSTAIN],
]);

type SubgraphVoterListItemBase = {
  voter: {
    id: string;
  };
  vote: SubgraphVoteValues;
};
export type SubgraphAddressListVoterListItem = SubgraphVoterListItemBase;

export type SubgraphErc20VoterListItem = SubgraphVoterListItemBase & {
  weight: string;
};

export type SubgraphAction = {
  to: string;
  value: string;
  data: string;
};

type SubgraphProposalBase = {
  id: string;
  dao: {
    id: string;
    name: string;
  };
  creator: string;
  metadata: string;
  yes: string;
  no: string;
  abstain: string;
  startDate: string;
  endDate: string;
  executed: boolean;
  executable: boolean;
};

export type SubgraphErc20ProposalListItem = SubgraphProposalBase & {
  pkg: {
    token: {
      symbol: string;
      name: string;
      id: string;
      decimals: string;
    };
  };
};

export type SubgraphErc20Proposal = SubgraphErc20ProposalListItem & {
  createdAt: string;
  actions: SubgraphAction[];
  supportRequiredPct: string;
  participationRequiredPct: string;
  voters: SubgraphErc20VoterListItem[];
  votingPower: string;
};
export type SubgraphAddressListProposalListItem = SubgraphProposalBase;
export type SubgraphAddressListProposal = SubgraphProposalBase & {
  createdAt: string;
  actions: SubgraphAction[];
  supportRequiredPct: string;
  participationRequired: string;
  voters: SubgraphAddressListVoterListItem[];
  votingPower: string;
};

export interface IComputeStatusProposal {
  startDate: string;
  endDate: string;
  executed: boolean;
  executable: boolean;
}

export interface IMintTokenParams {
  address: string;
  amount: bigint;
}

export type ContractMintTokenParams = [string, BigNumber];
export type ContractErc20InitParams = [
  string,
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  string,
];
export type ContractAddressListInitParams = [
  string,
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  string[],
];
export type ContractPluginSettings = [BigNumber, BigNumber, BigNumber];
