// This file contains the definitions of the Token client
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

// Token

export interface IClientTokenMethods extends IClientCore {
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
  getProposal: (propoosalId: string) => Promise<TokenProposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<TokenProposalListItem[]>;
  getSettings: (pluginAddress: string) => Promise<IPluginSettings | null>;
  getToken: (pluginAddress: string) => Promise<Erc20TokenDetails | null>;
}

export interface IClientTokenEncoding extends IClientCore {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: IPluginSettings,
  ) => DaoAction;
  mintTokenAction: (
    minterAddress: string,
    params: IMintTokenParams,
  ) => DaoAction;
}
export interface IClientTokenDecoding extends IClientCore {
  updatePluginSettingsAction: (data: Uint8Array) => IPluginSettings;
  mintTokenAction: (data: Uint8Array) => IMintTokenParams;
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
}
export interface IClientTokenEstimation extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => Promise<GasFeeEstimation>;
  voteProposal: (params: IVoteProposalParams) => Promise<GasFeeEstimation>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => Promise<GasFeeEstimation>;
}

/** Defines the shape of the Token client class */
export interface IClientToken {
  methods: IClientTokenMethods;
  encoding: IClientTokenEncoding;
  decoding: IClientTokenDecoding;
  estimation: IClientTokenEstimation;
}
// Factory init params

export type ITokenPluginInstall = {
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
export type TokenProposal = ProposalBase & {
  result: TokenProposalResult;
  settings: IProposalSettings;
  token: Erc20TokenDetails;
  usedVotingWeight: bigint;
  votes: Array<{ address: string; vote: VoteValues; weight: bigint }>;
  totalVotingWeight: bigint;
};

export type TokenProposalListItem = ProposalListItemBase & {
  token: Erc20TokenDetails;
  result: TokenProposalResult;
};

export type TokenProposalResult = {
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

export type SubgraphTokenVoterListItem = SubgraphVoterListItemBase & {
  weight: string;
};

export type SubgraphTokenProposalListItem = SubgraphProposalBase & {
  plugin: {
    token: {
      symbol: string;
      name: string;
      id: string;
      decimals: string;
    };
  };
};

export type SubgraphTokenProposal = SubgraphTokenProposalListItem & {
  createdAt: string;
  actions: SubgraphAction[];
  totalSupportThresholdPct: string;
  relativeSupportThresholdPct: string;
  voters: SubgraphTokenVoterListItem[];
  census: string;
};

export interface IMintTokenParams {
  address: string;
  amount: bigint;
}

export type ContractMintTokenParams = [string, BigNumber];
export type ContractTokenInitParams = [
  string, // dao address
  BigNumber, // participation
  BigNumber, // support
  BigNumber, // duration
  string, // token address
];
