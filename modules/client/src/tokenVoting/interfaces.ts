// This file contains the definitions of the TokenVoting client
import { BigNumber } from "@ethersproject/bignumber";
import {
  ContractVotingSettings,
  DaoAction,
  ExecuteProposalStepValue,
  GasFeeEstimation,
  ICanVoteParams,
  IClientCore,
  ICreateProposalParams,
  IExecuteProposalParams,
  IInterfaceParams,
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
  VotingMode,
  VotingSettings,
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
  getVotingSettings: (pluginAddress: string) => Promise<VotingSettings | null>;
  getToken: (
    pluginAddress: string,
  ) => Promise<Erc20TokenDetails | Erc721TokenDetails | null>;
}

export interface ITokenVotingClientEncoding extends IClientCore {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: VotingSettings,
  ) => DaoAction;
  mintTokenAction: (
    minterAddress: string,
    params: IMintTokenParams,
  ) => DaoAction;
}
export interface ITokenVotingClientDecoding extends IClientCore {
  updatePluginSettingsAction: (data: Uint8Array) => VotingSettings;
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
  votingSettings: VotingSettings;
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
  token: Erc20TokenDetails | Erc721TokenDetails | null;
  usedVotingWeight: bigint;
  votes: Array<{ address: string; vote: VoteValues; weight: bigint }>;
  totalVotingWeight: bigint;
  creationBlockNumber: number;
  executionDate: Date;
  executionBlockNumber: number;
  executionTxHash: string;
};

export type TokenVotingProposalListItem = ProposalListItemBase & {
  token: Erc20TokenDetails | Erc721TokenDetails | null;
  result: TokenVotingProposalResult;
};

export type TokenVotingProposalResult = {
  yes: bigint;
  no: bigint;
  abstain: bigint;
};

export type Erc20TokenDetails = TokenBaseDetails & {
  decimals: number;
};
export type Erc721TokenDetails = TokenBaseDetails & {
  baseUri: string;
};

export type TokenBaseDetails = {
  address: string;
  name: string;
  symbol: string;
};

export type SubgraphTokenVotingVoterListItem = SubgraphVoterListItemBase & {
  votingPower: string;
};

export type SubgraphTokenVotingProposalListItem = SubgraphProposalBase & {
  plugin: {
    token: SubgraphErc20Token | SubgraphErc721Token;
  };
};

type SubgraphBaseToken = {
  symbol: string;
  name: string;
  id: string;
  __typename: SubgraphTokenType;
};
export enum SubgraphTokenType {
  ERC20 = "ERC20Token",
  ERC721 = "ERC721Token",
}

export type SubgraphErc20Token = SubgraphBaseToken & {
  decimals: string;
};
export type SubgraphErc721Token = SubgraphBaseToken & {
  baseURI: string;
};

export type SubgraphTokenVotingProposal =
  & SubgraphTokenVotingProposalListItem
  & {
    createdAt: string;
    actions: SubgraphAction[];
    supportThreshold: string;
    voters: SubgraphTokenVotingVoterListItem[];
    minVotingPower: bigint;
    totalVotingPower: string;
    votingMode: VotingMode;
    creationBlockNumber: string;
    executionDate: string;
    executionTxHash: string;
    executionBlockNumber: string;
  };

export interface IMintTokenParams {
  address: string;
  amount: bigint;
}

export type ContractMintTokenParams = [string, BigNumber];
export type ContractTokenVotingInitParams = [
  ContractVotingSettings,
  [
    string, // address
    string, // name
    string, // symbol
  ],
  [
    string[], // receivers,
    BigNumber[], // amounts
  ],
];
