// This file contains the definitions of the ERC20 and Multisig DAO clients

import { IClientCore } from "./core";
import {
  DaoAction,
  PluginInitAction,
  GasFeeEstimation,
  IPagination,
  Proposal,
} from "./common";

// NOTE: These 2 clients will eventually be moved to their own package

// ERC20

/** Defines the shape of the ERC20 client class */
export interface IClientErc20 extends IClientCore {
  methods: {
    createProposal: (
      params: ICreateProposalParams
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (proposalId: string, vote: VoteOptions) => AsyncGenerator<VoteProposalStepValue>;
    executeProposal: (proposalId: string) => AsyncGenerator<ExecuteProposalStepValue>;
    setPluginConfig: (config: VotingConfig) => AsyncGenerator<SetVotingConfigStepValue>
    getMembers: () => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<Erc20Proposal>
    getProposalMany: (params?: IProposalQueryParams) => Promise<Erc20Proposal[]>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    init: (params: IErc20FactoryParams) => PluginInitAction;
    setPluginConfigAction: (params: VotingConfig) => DaoAction;
  };
  estimation: {
    createProposal: (
      params: ICreateProposalParams
    ) => Promise<GasFeeEstimation>;
    voteProposal: (
      proposalId: string,
      vote: VoteOptions
    ) => Promise<GasFeeEstimation>;
    executeProposal: (proposalId: string) => Promise<GasFeeEstimation>;
  };
}

// MULTISIG

/** Defines the shape of the Multisig client class */
export interface IClientMultisig extends IClientCore {
  methods: {
    createProposal: (
      params: ICreateProposalParams
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (proposalId: string, vote: VoteOptions) => AsyncGenerator<VoteProposalStepValue>;
    executeProposal: (proposalId: string) => AsyncGenerator<ExecuteProposalStepValue>;
    setPluginConfig: (config: VotingConfig) => AsyncGenerator<SetVotingConfigStepValue>
    getMembers: () => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<MultisigProposal>
    getProposalMany: (params?: IProposalQueryParams) => Promise<MultisigProposal[]>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    init: (params: IMultisigFactoryParams) => PluginInitAction;
    setPluginConfigAction: (params: VotingConfig) => DaoAction;
  };
  estimation: {
    createProposal: (params: ICreateProposalParams) => Promise<GasFeeEstimation>;
    voteProposal: (proposalId: string, vote: VoteOptions) => Promise<GasFeeEstimation>;
    executeProposal: (proposalId: string) => Promise<GasFeeEstimation>;
  };
}

// TYPES

export interface TokenConfig {
  address: string;
  name: string;
  symbol: string;
}

export interface MintConfig {
  address: string;
  balance: bigint;
}

export interface VotingConfig {
  /** 0-100 as a percentage */
  minSupport: number;
  /** 0-100 as a percentage */
  minParticipation: number;
  // TODO: In seconds vs in blocks doesn't make sense
  /** In seconds */
  minDuration: number;
}

export interface ICreateProposalParams {
  metadataUri: string;
  actions?: DaoAction[];
  startDate?: Date;
  endDate?: Date;
  executeIfPassed?: boolean;
  creatorVote?: VoteOptions;
}
// TODO: Confirm values
export enum VoteOptions {
  NONE = 0,
  ABSTAIN = 1,
  YES = 2,
  NO = 3,
}

export interface IWithdrawParams {
  recipientAddress: string;
  amount: bigint;
  tokenAddress?: string;
  reference?: string;
}

// Factory init params

export interface IErc20FactoryParams {
  tokenConfig: TokenConfig;
  mintConfig: MintConfig[];
  votingConfig: VotingConfig;
}

export interface IMultisigFactoryParams {
  votingConfig: VotingConfig;
  whitelistVoters: string[];
}

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

// VOTING CONFIGURATION
export enum SetVotingConfigStep {
  CREATING_PROPOSAL = "creating_proposal",
  DONE = "done",
}

export type SetVotingConfigStepValue =
  | { key: SetVotingConfigStep.CREATING_PROPOSAL; txHash: string }
  | { key: SetVotingConfigStep.DONE; };

// PROPOSAL RETRIEVAL

// ERC20 PROPOSAL

export type Erc20Proposal = Proposal & {
  voteId: string;
  token: Erc20Token;

  result: {
    yes?: number;
    no?: number;
    abstain?: number;
  };

  config: {
    participationRequiredPct: number;
    supportRequiredPct: number;
  };

  votingPower: number;
  voters: { address: string; voteValue: VoteOptions; weight: number }[];

  open: boolean;
  executed: boolean;
};
export type Erc20Token = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};
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


// MULTISIG PROPOSAL

export type MultisigProposal = Proposal & {
  voteId: string;

  result: {
    yes?: number;
    no?: number;
    abstain?: number;
  };

  config: {
    participationRequiredPct: number;
    supportRequiredPct: number;
  };

  voters: { address: string; voteValue: VoteOptions; weight: number }[];

  open: boolean;
  executed: boolean;
};


