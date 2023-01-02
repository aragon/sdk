// This file contains the definitions of the TokenVoting client
import { BigNumber } from "@ethersproject/bignumber";
import {
  DaoAction,
  ExecuteProposalStepValue,
  GasFeeEstimation,
  ICanVoteParams,
  IClientCore,
  ICreateProposalParams,
  IExecuteProposalParams,
  IInterfaceParams,
  IPluginSettings,
  IProposalQueryParams,
  IProposalSettings,
  IVoteProposalParams,
  ProposalBase,
  ProposalCreationStepValue,
  ProposalListItemBase,
  ProposalMetadata,
  SubgraphAction,
  SubgraphProposalBase,
  SubgraphVoterListItemBase,
  VoteProposalStepValue,
  VoteValues,
} from "../client-common";

// TokenVoting

export interface ITokenVotingClientMethods extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => AsyncGenerator<ProposalCreationStepValue>;
  pinMetadata: (params: ProposalMetadata) => Promise<string>;
  voteProposal: (
    params: IVoteProposalParams,
  ) => AsyncGenerator<VoteProposalStepValue>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  canVote: (params: ICanVoteParams) => Promise<boolean>;
  getMembers: (addressOrEns: string) => Promise<string[]>;
  getProposal: (propoosalId: string) => Promise<TokenVotingProposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<TokenVotingProposalListItem[]>;
  getSettings: (pluginAddress: string) => Promise<IPluginSettings | null>;
  getToken: (pluginAddress: string) => Promise<Erc20TokenDetails | null>;
}

export interface ITokenVotingClientEncoding extends IClientCore {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: IPluginSettings,
  ) => DaoAction;
  mintTokenAction: (
    minterAddress: string,
    params: IMintTokenParams,
  ) => DaoAction;
}
export interface ITokenVotingClientDecoding extends IClientCore {
  updatePluginSettingsAction: (data: Uint8Array) => IPluginSettings;
  mintTokenAction: (data: Uint8Array) => IMintTokenParams;
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
}
export interface ITokenVotingClientEstimation extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => Promise<GasFeeEstimation>;
  voteProposal: (params: IVoteProposalParams) => Promise<GasFeeEstimation>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => Promise<GasFeeEstimation>;
}

/** Defines the shape of the Token client class */
export interface ITokenVotingClient {
  methods: ITokenVotingClientMethods;
  encoding: ITokenVotingClientEncoding;
  decoding: ITokenVotingClientDecoding;
  estimation: ITokenVotingClientEstimation;
}
// Factory init params

export type ITokenVotingPluginInstall = {
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

// PROPOSAL RETRIEVAL
export type TokenVotingProposal = ProposalBase & {
  result: TokenVotingProposalResult;
  settings: IProposalSettings;
  token: Erc20TokenDetails;
  usedVotingWeight: bigint;
  votes: Array<{ address: string; vote: VoteValues; weight: bigint }>;
  totalVotingWeight: bigint;
};

export type TokenVotingProposalListItem = ProposalListItemBase & {
  token: Erc20TokenDetails;
  result: TokenVotingProposalResult;
};

export type TokenVotingProposalResult = {
  yes: bigint;
  no: bigint;
  abstain: bigint;
};

export type Erc20TokenDetails = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

export type SubgraphTokenVotingVoterListItem = SubgraphVoterListItemBase & {
  weight: string;
};

export type SubgraphTokenVotingProposalListItem = SubgraphProposalBase & {
  plugin: {
    token: {
      symbol: string;
      name: string;
      id: string;
      decimals: string;
    };
  };
};

export type SubgraphTokenVotingProposal = SubgraphTokenVotingProposalListItem & {
  createdAt: string;
  actions: SubgraphAction[];
  totalSupportThresholdPct: string;
  relativeSupportThresholdPct: string;
  voters: SubgraphTokenVotingVoterListItem[];
  census: string;
};

export interface IMintTokenParams {
  address: string;
  amount: bigint;
}

export type ContractMintTokenParams = [string, BigNumber];
export type ContractTokenVotingInitParams = [
  string, // dao address
  BigNumber, // participation
  BigNumber, // support
  BigNumber, // duration
  string, // token address
];
