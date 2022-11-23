// This file contains the definitions of the ERC20 client
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
  SubgraphAction,
  SubgraphProposalBase,
  SubgraphVoterListItemBase,
  VoteProposalStepValue,
  VoteValues,
} from "../client-common";

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

// PROPOSAL RETRIEVAL
export type Erc20Proposal = ProposalBase & {
  result: Erc20ProposalResult;
  settings: IProposalSettings;
  token: Erc20TokenDetails;
  usedVotingWeight: bigint;
  votes: Array<{ address: string; vote: VoteValues; weight: bigint }>;
  totalVotingWeight: bigint;
};

export type Erc20ProposalListItem = ProposalListItemBase & {
  token: Erc20TokenDetails;
  result: Erc20ProposalResult;
};

export type Erc20ProposalResult = {
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

export type SubgraphErc20VoterListItem = SubgraphVoterListItemBase & {
  weight: string;
};

export type SubgraphErc20ProposalListItem = SubgraphProposalBase & {
  plugin: {
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
  totalSupportThresholdPct: string;
  relativeSupportThresholdPct: string;
  voters: SubgraphErc20VoterListItem[];
  census: string;
};

export interface IMintTokenParams {
  address: string;
  amount: bigint;
}

export type ContractMintTokenParams = [string, BigNumber];
export type ContractErc20InitParams = [
  string, // dao address
  BigNumber, // participation
  BigNumber, // support
  BigNumber, // duration
  string, // token address
];
