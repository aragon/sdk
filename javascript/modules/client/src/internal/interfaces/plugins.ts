// This file contains the definitions of the ERC20 and Multisig DAO clients

import { IClientCore } from "./core";
import { DaoAction, DaoConfig, FactoryInitParams } from "./common";

// NOTE: These 2 clients will eventually be moved to their own package

// ERC20

/** Defines the shape of the ERC20 client class */
export interface IClientErc20 extends IClientCore {
  methods: {
    createProposal: (
      params: ICreateProposalParams,
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (proposalId: string, vote: VoteOptions) => Promise<void>;
    executeProposal: (proposalId: string) => Promise<void>;
    setDaoConfig: (address: string, config: DaoConfig) => Promise<void>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<void>;
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    init: (params: IErc20FactoryParams) => FactoryInitParams;
    /** Compones the action payload to pass upon proposal creation */
    withdrawAction: (to: string, value: bigint, params: IWithdrawParams) => DaoAction;
  };
  estimation: {
    createProposal: (params: ICreateProposalParams) => Promise<bigint>;
    voteProposal: (proposalId: string, vote: VoteOptions) => Promise<bigint>;
    executeProposal: (proposalId: string) => Promise<bigint>;
    setDaoConfig: (address: string, config: DaoConfig) => Promise<bigint>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<bigint>;
  };
}

// MULTISIG

/** Defines the shape of the Multisig client class */
export interface IClientMultisig extends IClientCore {
  methods: {
    createProposal: (
      params: ICreateProposalParams,
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (proposalId: string, vote: VoteOptions) => Promise<void>;
    executeProposal: (proposalId: string) => Promise<void>;
    setDaoConfig: (address: string, config: DaoConfig) => Promise<void>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<void>;
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    init: (params: IMultisigFactoryParams) => FactoryInitParams;
    /** Compones the action payload to pass upon proposal creation */
    withdrawAction: (to: string, value: bigint, params: IWithdrawParams) => DaoAction;
  };
  estimation: {
    createProposal: (params: ICreateProposalParams) => Promise<bigint>;
    voteProposal: (proposalId: string, vote: VoteOptions) => Promise<bigint>;
    executeProposal: (proposalId: string) => Promise<bigint>;
    setDaoConfig: (address: string, config: DaoConfig) => Promise<bigint>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<bigint>;
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
  // TODO: Clarify => block number? timestamp?
  startDate?: number;
  // TODO: Clarify => block number? timestamp?
  endDate?: number;
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
  to: string;
  amount: bigint;
  token?: string;
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
