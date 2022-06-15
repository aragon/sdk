// This file contains the definitions of the ERC20 and Multisig DAO clients

import { IClientCore } from "./core";
import { BigNumber } from "@ethersproject/bignumber";
import { DaoAction, DaoConfig, FactoryInitParams } from "./common";

// NOTE: These 2 clients will eventually be moved to their own package

// ERC20

/** Defines the shape of the ERC20 client class */
export interface IClientErc20 extends IClientCore {
  methods: {
    createProposal: (params: ICreateProposalParams) => Promise<BigNumber>;
    voteProposal: (proposalId: string, approve: VoteOptions) => Promise<void>;
    executeProposal: (proposalId: string) => Promise<void>;
    setDaoConfig: (address: string, config: DaoConfig) => Promise<void>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<void>;
  };
  actionBuilders: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    init: (params: IErc20FactoryParams) => FactoryInitParams;
    /** Compones the action payload to pass upon proposal creation */
    withdraw: (to: string, value: bigint, params: IWithdrawParams) => DaoAction;
  };
  estimation: {
    createProposal: (params: ICreateProposalParams) => Promise<bigint>;
    voteProposal: (proposalId: string, approve: VoteOptions) => Promise<bigint>;
    executeProposal: (proposalId: string) => Promise<bigint>;
    setDaoConfig: (address: string, config: DaoConfig) => Promise<bigint>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<bigint>;
  };
}

// MULTISIG

/** Defines the shape of the Multisig client class */
export interface IClientMultisig extends IClientCore {
  methods: {
    createProposal: (params: ICreateProposalParams) => Promise<BigNumber>;
    voteProposal: (proposalId: string, approve: VoteOptions) => Promise<void>;
    executeProposal: (proposalId: string) => Promise<void>;
    setDaoConfig: (address: string, config: DaoConfig) => Promise<void>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<void>;
  };
  actionBuilders: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    init: (params: IMultisigFactoryParams) => FactoryInitParams;
    /** Compones the action payload to pass upon proposal creation */
    withdraw: (to: string, value: bigint, params: IWithdrawParams) => DaoAction;
  };
  estimation: {
    createProposal: (params: ICreateProposalParams) => Promise<bigint>;
    voteProposal: (proposalId: string, approve: VoteOptions) => Promise<bigint>;
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
  metadata: string;
  actions?: DaoAction[];
  // TODO: Clarify => block number? timestamp?
  startDate?: number;
  // TODO: Clarify => block number? timestamp?
  endDate?: number;
  executeIfPassed?: boolean;
  creatorVote?: VoteOptions;
}

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
