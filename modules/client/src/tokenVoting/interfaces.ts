// This file contains the definitions of the TokenVoting client
import {
  CanVoteParams,
  CreateMajorityVotingProposalParams,
  DaoAction,
  ExecuteProposalStepValue,
  GasFeeEstimation,
  IClientCore,
  InterfaceParams,
  VoteProposalParams,
  PrepareInstallationStepValue,
  ProposalCreationStepValue,
  ProposalMetadata,
  VoteProposalStepValue,
  VotingSettings,
  ProposalQueryParams,
} from "../client-common";
import {
  Erc20TokenDetails,
  Erc721TokenDetails,
  MintTokenParams,
  TokenVotingPluginPrepareInstallationParams,
  TokenVotingProposal,
  TokenVotingProposalListItem,
  UnwrapTokensParams,
  UnwrapTokensStepValue,
  WrapTokensParams,
  WrapTokensStepValue,
} from "./types";

// TokenVoting

export interface ITokenVotingClientMethods extends IClientCore {
  createProposal: (
    params: CreateMajorityVotingProposalParams,
  ) => AsyncGenerator<ProposalCreationStepValue>;
  pinMetadata: (params: ProposalMetadata) => Promise<string>;
  voteProposal: (
    params: VoteProposalParams,
  ) => AsyncGenerator<VoteProposalStepValue>;
  executeProposal: (
    proposalId: string,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  prepareInstallation: (
    params: TokenVotingPluginPrepareInstallationParams,
  ) => AsyncGenerator<PrepareInstallationStepValue>;
  canVote: (params: CanVoteParams) => Promise<boolean>;
  canExecute: (proposalId: string) => Promise<boolean>;
  getMembers: (addressOrEns: string) => Promise<TokenVotingMember[]>;
  getProposal: (propoosalId: string) => Promise<TokenVotingProposal | null>;
  getProposals: (
    params: ProposalQueryParams,
  ) => Promise<TokenVotingProposalListItem[]>;
  getVotingSettings: (pluginAddress: string) => Promise<VotingSettings | null>;
  getToken: (
    pluginAddress: string,
  ) => Promise<Erc20TokenDetails | Erc721TokenDetails | null>;
  wrapTokens: (params: WrapTokensParams) => AsyncGenerator<WrapTokensStepValue>;
  unwrapTokens: (
    params: UnwrapTokensParams,
  ) => AsyncGenerator<UnwrapTokensStepValue>;
  delegateTokens: (
    params: DelegateTokensParams,
  ) => AsyncGenerator<DelegateTokensStepValue>;
  undelegateTokens: (
    tokenAddress: string,
  ) => AsyncGenerator<UndelegateTokensStepValue>;
  getDelegatee: (tokenAddress: string) => Promise<string | null>;
}

export interface ITokenVotingClientEncoding extends IClientCore {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: VotingSettings,
  ) => DaoAction;
  mintTokenAction: (
    minterAddress: string,
    params: MintTokenParams,
  ) => DaoAction;
}
export interface ITokenVotingClientDecoding extends IClientCore {
  updatePluginSettingsAction: (data: Uint8Array) => VotingSettings;
  mintTokenAction: (data: Uint8Array) => MintTokenParams;
  findInterface: (data: Uint8Array) => InterfaceParams | null;
}
export interface ITokenVotingClientEstimation extends IClientCore {
  createProposal: (
    params: CreateMajorityVotingProposalParams,
  ) => Promise<GasFeeEstimation>;
  voteProposal: (params: VoteProposalParams) => Promise<GasFeeEstimation>;
  executeProposal: (
    proposalId: string,
  ) => Promise<GasFeeEstimation>;
  delegateTokens: (
    params: DelegateTokensParams,
  ) => Promise<GasFeeEstimation>;
  undelegateTokens: (
    tokenAddress: string,
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

export type DelegateTokensParams = {
  tokenAddress: string;
  delegatee: string;
};

export const enum DelegateTokensStep {
  DELEGATING = "delegating",
  DONE = "done",
}

export const enum UndelegateTokensStep {
  UNDELEGATING = "delegating",
  DONE = "done",
}

type DelegateTokensStepCommon = {
  key: DelegateTokensStep.DELEGATING | UndelegateTokensStep.UNDELEGATING;
  txHash: string;
} | { key: DelegateTokensStep.DONE | UndelegateTokensStep.DONE };

export type UndelegateTokensStepValue = DelegateTokensStepCommon;
export type DelegateTokensStepValue = DelegateTokensStepCommon;

export type SubgraphTokenVotingMember = {
  address: string;
  balance: string;
  votingPower: string;
  delegatee: {
    address: string;
  };
  delegators: {
    address: string;
    balance: string;
  }[];
};

export type TokenVotingMember = {
  /** The address of the member */
  address: string;
  /** The balance of the member */
  balance: bigint;
  /** The voting power of the member taking into account the delagation */
  votingPower: bigint;
  /** The address that you delegated yout voting power to
   *  If null, you are not delegating your voting power */
  delegatee: string | null;
  /** The list of addresses that delegated their voting power this member */
  delegators: { address: string; balance: bigint }[];
};