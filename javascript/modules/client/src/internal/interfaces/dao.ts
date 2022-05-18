import { IClientCore } from "./client-core";
import { BigNumber } from "@ethersproject/bignumber";

export interface IClientDaoBase extends IClientCore {
  dao: {
    /** Checks whether a role is granted by the curren DAO's ACL settings */
    hasPermission: (
      where: string,
      who: string,
      role: DaoRole,
      data: Uint8Array
    ) => Promise<void>;
  };
  actions: {
    withdraw: (to: string, value: bigint, params: IWithdraw) => IProposalAction;
  };
}

export interface IClientDaoERC20Voting extends IClientCore {
  dao: {
    create: (params: ICreateDaoERC20Voting) => Promise<string>;
    deposit: (params: IDeposit) => Promise<void>;
    simpleVote: {
      createProposal: (
        votingAddress: string,
        params: ICreateProposal
      ) => Promise<BigNumber>;
      voteProposal: (proposalId: string, approve: boolean) => Promise<void>;
      executeProposal: (proposalId: string) => Promise<void>;
      setDaoConfig: (address: string, config: DaoConfig) => Promise<void>;
      setVotingConfig: (address: string, config: VotingConfig) => Promise<void>;
    };
  };
  estimate: {
    create: (params: ICreateDaoERC20Voting) => Promise<IGasFeeEstimation>;
  };
}

export interface IClientDaoWhitelistVoting extends IClientCore {
  dao: {
    create: (params: ICreateDaoWhitelistVoting) => Promise<string>;
    deposit: (params: IDeposit) => Promise<void>;
    whitelist: {
      createProposal: (
        votingAddress: string,
        params: ICreateProposal
      ) => Promise<BigNumber>;
      voteProposal: (proposalId: string, approve: boolean) => Promise<void>;
      executeProposal: (proposalId: string) => Promise<void>;
      setDaoConfig: (address: string, config: DaoConfig) => Promise<void>;
      setVotingConfig: (address: string, config: VotingConfig) => Promise<void>;
    };
  };
  estimate: {
    create: (params: ICreateDaoWhitelistVoting) => Promise<IGasFeeEstimation>;
  };
}

// DAO DATA TYPES

export enum DaoRole {
  UPGRADE_ROLE = "UPGRADE_ROLE",
  DAO_CONFIG_ROLE = "DAO_CONFIG_ROLE",
  EXEC_ROLE = "EXEC_ROLE",
  WITHDRAW_ROLE = "WITHDRAW_ROLE",
  SET_SIGNATURE_VALIDATOR_ROLE = "SET_SIGNATURE_VALIDATOR_ROLE",
}

/** Global settings applied to the organization */
export interface ICreateDaoERC20Voting {
  daoConfig: DaoConfig;
  tokenConfig: TokenConfig;
  mintConfig: MintConfig[];
  votingConfig: VotingConfig;
  gsnForwarder?: string;
}

export interface ICreateDaoWhitelistVoting {
  daoConfig: DaoConfig;
  votingConfig: VotingConfig;
  whitelistVoters: string[];
  gsnForwarder?: string;
}

export interface DaoConfig {
  name: string;
  metadata: string;
}

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
  /** In seconds */
  minDuration: number;
}

export interface ICreateProposal {
  metadata: string;
  actions?: IProposalAction[];
  startDate?: number;
  endDate?: number;
  executeIfDecided?: boolean;
  creatorChoice?: VoteOption;
}

export interface IProposalAction {
  to: string;
  value: bigint;
  data: string;
}

export enum VoteOption {
  NONE,
  ABSTAIN,
  YEA,
  NAY,
}

export interface IGasFeeEstimation {
  average: bigint;
  max: bigint;
}

export interface IDeposit {
  daoAddress: string;
  amount: bigint;
  token?: string;
  reference?: string;
}

export interface IWithdraw {
  to: string;
  amount: bigint;
  token?: string;
  reference?: string;
}
