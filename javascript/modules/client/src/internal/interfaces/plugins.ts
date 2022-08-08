// This file contains the definitions of the ERC20 and Multisig DAO clients

import { IClientCore } from "./core";
import {
  DaoAction,
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
      params: ICreateProposal
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (proposalId: string, vote: VoteOptions) => AsyncGenerator<VoteProposalStepValue>;
    executeProposal: (proposalId: string) => AsyncGenerator<ExecuteProposalStepValue>;
    setPluginConfig: (config: ProposalConfig) => AsyncGenerator<SetPluginConfigStepValue>
    getMembers: () => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<Erc20Proposal>
    getProposals: (params?: IProposalQueryParams) => Promise<Erc20Proposal[]>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    setPluginConfigAction: (params: ProposalConfig) => DaoAction;
  };
  estimation: {
    createProposal: (
      params: ICreateProposal
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
      params: ICreateProposal
    ) => AsyncGenerator<ProposalCreationStepValue>;
    voteProposal: (proposalId: string, vote: VoteOptions) => AsyncGenerator<VoteProposalStepValue>;
    executeProposal: (proposalId: string) => AsyncGenerator<ExecuteProposalStepValue>;
    setPluginConfig: (config: ProposalConfig) => AsyncGenerator<SetPluginConfigStepValue>
    getMembers: () => Promise<string[]>;
    getProposal: (propoosalId: string) => Promise<MultisigProposal>
    getProposals: (params?: IProposalQueryParams) => Promise<MultisigProposal[]>
  };
  encoding: {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    setPluginConfigAction: (params: ProposalConfig) => DaoAction;
  };
  estimation: {
    createProposal: (params: ICreateProposal) => Promise<GasFeeEstimation>;
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

export interface ProposalConfig {
  /** Float: 0 to 1 */
  minSupport: number;
  /** Float: 0 to 1 */
  minTurnout: number;
  /** In seconds */
  minDuration: number;
}

export interface ICreateProposal {
  metadata: IProposalMetadata;
  actions?: DaoAction[];
  startDate?: Date;
  endDate?: Date;
  executeOnPass?: boolean;
  creatorVote?: VoteOptions;
}


export interface IProposalMetadata {
  title: string
  summary: string
  description: string
  resources: Array<{ url: string, name: string }>
  media?: {
    header?: string
    logo?: string
  }
}

// TODO: Confirm values
export enum VoteOptions {
  // NONE = 0,
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

export type IErc20PluginInstall = {
  proposals: ProposalConfig;
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

export type IMultisigPluginInstall = {
	addresses: string[],
  proposals: ProposalConfig
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
export enum SetPluginConfigStep {
  CREATING_PROPOSAL = "creating_proposal",
  DONE = "done",
}

export type SetPluginConfigStepValue =
  | { key: SetPluginConfigStep.CREATING_PROPOSAL; txHash: string }
  | { key: SetPluginConfigStep.DONE; };

// PROPOSAL RETRIEVAL

// ERC20 PROPOSAL

export type Erc20Proposal = Proposal & {
  token: Erc20Token;
  result: {
    yes?: number;
    no?: number;
    abstain?: number;
  };
  config: {
    minParticipationPct: number;
    minTurnoutPct: number;
  };
  votingPower: number;
  voters: { address: string; voteValue: VoteOptions; weight: number }[];
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
  result: {
    yes?: number;
    no?: number;
    abstain?: number;
  };
  config: {
    minParticipationPct: number;
    minTurnoutPct: number;
  };
  voters: { address: string; voteValue: VoteOptions; weight: number }[];
};


