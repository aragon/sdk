// This file contains the definitions of the TokenVoting client
import {
  DaoAction,
  GasFeeEstimation,
  InterfaceParams,
  PrepareInstallationStepValue,
  ProposalMetadata,
} from "@aragon/sdk-client-common";
import {
  CanVoteParams,
  CreateMajorityVotingProposalParams,
  ExecuteProposalStepValue,
  ProposalCreationStepValue,
  ProposalQueryParams,
  VoteProposalParams,
  VoteProposalStepValue,
  VotingSettings,
} from "../../client-common";
import {
  DelegateTokensParams,
  DelegateTokensStepValue,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
  Erc721TokenDetails,
  MintTokenParams,
  TokenVotingMember,
  TokenVotingPluginPrepareInstallationParams,
  TokenVotingProposal,
  TokenVotingProposalListItem,
  UndelegateTokensStepValue,
  UnwrapTokensParams,
  UnwrapTokensStepValue,
  WrapTokensParams,
  WrapTokensStepValue,
} from "../types";

// TokenVoting

export interface ITokenVotingClientMethods {
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
  getMembers: (
    addressOrEns: string,
    blockNumber?: number,
  ) => Promise<TokenVotingMember[]>;
  getProposal: (propoosalId: string) => Promise<TokenVotingProposal | null>;
  getProposals: (
    params: ProposalQueryParams,
  ) => Promise<TokenVotingProposalListItem[]>;
  getVotingSettings: (
    pluginAddress: string,
    blockNumber?: number,
  ) => Promise<VotingSettings | null>;
  getToken: (
    pluginAddress: string,
  ) => Promise<
    Erc20TokenDetails | Erc20WrapperTokenDetails | Erc721TokenDetails | null
  >;
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
  isTokenGovernanceCompatible: (tokenAddress: string) => Promise<boolean>;
}

export interface ITokenVotingClientEncoding {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: VotingSettings,
  ) => DaoAction;
  mintTokenAction: (
    minterAddress: string,
    params: MintTokenParams,
  ) => DaoAction;
}
export interface ITokenVotingClientDecoding {
  updatePluginSettingsAction: (data: Uint8Array) => VotingSettings;
  mintTokenAction: (data: Uint8Array) => MintTokenParams;
  findInterface: (data: Uint8Array) => InterfaceParams | null;
}
export interface ITokenVotingClientEstimation {
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
