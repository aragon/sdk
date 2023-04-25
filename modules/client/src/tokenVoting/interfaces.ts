// This file contains the definitions of the TokenVoting client
import { BigNumber } from "@ethersproject/bignumber";
import {
  CanVoteParams,
  ContractVotingSettings,
  CreateMajorityVotingProposalParams,
  DaoAction,
  ExecuteProposalStepValue,
  GasFeeEstimation,
  IClientCore,
  IInterfaceParams,
  IProposalQueryParams,
  IVoteProposalParams,
  MajorityVotingProposalSettings,
  PrepareInstallationStepValue,
  ProposalBase,
  ProposalCreationStepValue,
  ProposalListItemBase,
  ProposalMetadata,
  SubgraphAction,
  SubgraphProposalBase,
  SubgraphVoterListItemBase,
  VersionTag,
  VoteProposalStepValue,
  VoteValues,
  VotingMode,
  VotingSettings,
} from "../client-common";
import { TokenType } from "../interfaces";

// TokenVoting

export interface ITokenVotingClientMethods extends IClientCore {
  createProposal: (
    params: CreateMajorityVotingProposalParams,
  ) => AsyncGenerator<ProposalCreationStepValue>;
  pinMetadata: (params: ProposalMetadata) => Promise<string>;
  voteProposal: (
    params: IVoteProposalParams,
  ) => AsyncGenerator<VoteProposalStepValue>;
  executeProposal: (
    proposalId: string,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  prepareInstallation: (
    params: TokenVotingPluginPrepareInstallationParams,
  ) => AsyncGenerator<PrepareInstallationStepValue>;
  canVote: (params: CanVoteParams) => Promise<boolean>;
  canExecute: (proposalId: string) => Promise<boolean>;
  getMembers: (addressOrEns: string) => Promise<string[]>;
  getProposal: (propoosalId: string) => Promise<TokenVotingProposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<TokenVotingProposalListItem[]>;
  getVotingSettings: (pluginAddress: string) => Promise<VotingSettings | null>;
  getToken: (
    pluginAddress: string,
  ) => Promise<Erc20TokenDetails | Erc721TokenDetails | null>;
  wrapTokens: (params: WrapTokensParams) => AsyncGenerator<WrapTokensStepValue>;
  unwrapTokens: (
    params: UnwrapTokensParams,
  ) => AsyncGenerator<UnwrapTokensStepValue>;
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
    params: CreateMajorityVotingProposalParams,
  ) => Promise<GasFeeEstimation>;
  voteProposal: (params: IVoteProposalParams) => Promise<GasFeeEstimation>;
  executeProposal: (
    proposalId: string,
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
  tokenAddress: string;
  wrappedToken: {
    name: string;
    symbol: string;
  };
}

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
  settings: MajorityVotingProposalSettings;
  token: Erc20TokenDetails | Erc721TokenDetails | null;
  usedVotingWeight: bigint;
  votes: Array<
    { address: string; vote: VoteValues; weight: bigint; voteReplaced: boolean }
  >;
  totalVotingWeight: bigint;
  creationBlockNumber: number;
  executionDate: Date | null;
  executionBlockNumber: number | null;
  executionTxHash: string | null;
};

export type TokenVotingProposalListItem = ProposalListItemBase & {
  token: Erc20TokenDetails | Erc721TokenDetails | null;
  result: TokenVotingProposalResult;
  totalVotingWeight: bigint;
  settings: MajorityVotingProposalSettings;
  votes: Array<
    { address: string; vote: VoteValues; weight: bigint; voteReplaced: boolean }
  >;
};

export type TokenVotingProposalResult = {
  yes: bigint;
  no: bigint;
  abstain: bigint;
};

export type Erc20TokenDetails = TokenBaseDetails & {
  decimals: number;
  type: TokenType.ERC20;
};
export type Erc721TokenDetails = TokenBaseDetails & {
  type: TokenType.ERC721;
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
  voters: SubgraphTokenVotingVoterListItem[];
  supportThreshold: string;
  minVotingPower: bigint;
  totalVotingPower: string;
  votingMode: VotingMode;
  earlyExecutable: boolean;
};

type SubgraphBaseToken = {
  symbol: string;
  name: string;
  id: string;
};
export enum SubgraphTokenType {
  ERC20 = "ERC20Token",
  ERC721 = "ERC721Token",
}
export enum SubgraphContractType {
  ERC20 = "ERC20Contract",
  ERC721 = "ERC721Contract",
}

export type SubgraphErc20Token = SubgraphBaseToken & {
  __typename: SubgraphContractType.ERC20;
  decimals: number;
};
export type SubgraphErc721Token = SubgraphBaseToken & {
  __typename: SubgraphContractType.ERC721;
};

export type SubgraphTokenVotingProposal =
  & SubgraphTokenVotingProposalListItem
  & {
    createdAt: string;
    actions: SubgraphAction[];
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

export type TokenVotingPluginPrepareInstallationParams = {
  settings: ITokenVotingPluginInstall;
  daoAddressOrEns: string;
  versionTag?: VersionTag;
};

type WrapTokensBase = {
  wrappedTokenAddress: string;
  amount: bigint;
};

export type WrapTokensParams = WrapTokensBase;
export type UnwrapTokensParams = WrapTokensBase;

export enum WrapTokensStep {
  WRAPPING = "wrapping",
  DONE = "done",
}

export type WrapTokensStepValue =
  | { key: WrapTokensStep.WRAPPING; txHash: string }
  | { key: WrapTokensStep.DONE };

export enum UnwrapTokensStep {
  UNWRAPPING = "unwrapping",
  DONE = "done",
}
export type UnwrapTokensStepValue =
  | { key: UnwrapTokensStep.UNWRAPPING; txHash: string }
  | { key: UnwrapTokensStep.DONE };
