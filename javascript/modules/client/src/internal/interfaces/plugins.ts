// This file contains the definitions of the ERC20 and Multisig DAO clients

import { IClientCore } from "./core";
import {
  DaoAction,
  FactoryInitParams,
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
    setVotingConfig: (address: string, config: VotingConfig) => AsyncGenerator<SetVotingConfigStepValue>
    getMembers: (daoAddressOrEns: string) => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<Erc20Proposal>
    getProposalMany: (params?: IERC20ProposalQueryParams) => Promise<Erc20Proposal[]>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    init: (params: IErc20FactoryParams) => FactoryInitParams;
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
    setVotingConfig: (daoAddressOrEns: string, config: VotingConfig) => Promise<GasFeeEstimation>;
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
    setVotingConfig: (address: string, config: VotingConfig) => AsyncGenerator<SetVotingConfigStepValue>
    getMembers: (daoAddressOrEns: string) => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<MultisigProposal>
    getProposalMany: (params?: IMultisigProposalQueryParams) => Promise<MultisigProposal[]>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    init: (params: IMultisigFactoryParams) => FactoryInitParams;
  };
  estimation: {
    createProposal: (params: ICreateProposalParams) => Promise<GasFeeEstimation>;
    voteProposal: (proposalId: string, vote: VoteOptions) => Promise<GasFeeEstimation>;
    executeProposal: (proposalId: string) => Promise<GasFeeEstimation>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<GasFeeEstimation>;
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
  YEA = 2,
  NAY = 3,
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
  | { key: ExecuteProposalStep.DONE; voteId: string };

// VOTING CONFIGURATION
export enum SetVotingConfigStep {
  CONFIGURING = "configuring",
  DONE = "done",
}

export type SetVotingConfigStepValue =
  | { key: SetVotingConfigStep.CONFIGURING; txHash: string }
  | { key: SetVotingConfigStep.DONE; };

// PROPOSAL RETRIEVAL

// ERC20 PROPOSAL

export type Erc20Proposal = Proposal & {
  voteId: string;
  token: Erc20Token;

  result: {
    yea?: number;
    nay?: number;
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
export interface IERC20ProposalQueryParams extends IPagination {
  sortBy?: ERC20ProposalSortBy
  addressOrEns?: string
}


export enum ERC20ProposalSortBy {
  CREATED_AT,
  NAME,
  POPULARITY,
  VOTES // currently defined as number of proposals
}


// MULTISIG PROPOSAL

export type MultisigProposal = Proposal & {
  voteId: string;

  result: {
    yea?: number;
    nay?: number;
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

export interface IMultisigProposalQueryParams extends IPagination {
  sortBy?: MultisigProposalSortBy
  daoAddressOrEns?: string
}


export enum MultisigProposalSortBy {
  CREATED_AT,
  NAME,
  POPULARITY,
  VOTES // currently defined as number of proposals
}

