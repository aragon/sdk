import { IClientCore } from "./core";
import { BigNumber } from "@ethersproject/bignumber";
import { DaoAction, DaoConfig } from "../common";

export interface IClientERC20Governance extends IClientCore {
  methods: {
    createProposal: (
      votingAddress: string,
      params: ICreateProposal
    ) => Promise<BigNumber>;
    voteProposal: (proposalId: string, approve: boolean) => Promise<void>;
    executeProposal: (proposalId: string) => Promise<void>;
    setDaoConfig: (address: string, config: DaoConfig) => Promise<void>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<void>;
  };
}

export interface IClientWhitelistGovernance extends IClientCore {
  methods: {
    createProposal: (
      votingAddress: string,
      params: ICreateProposal
    ) => Promise<BigNumber>;
    voteProposal: (proposalId: string, approve: boolean) => Promise<void>;
    executeProposal: (proposalId: string) => Promise<void>;
    setDaoConfig: (address: string, config: DaoConfig) => Promise<void>;
    setVotingConfig: (address: string, config: VotingConfig) => Promise<void>;
  };
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
  actions?: DaoAction[];
  startDate?: number;
  endDate?: number;
  executeIfDecided?: boolean;
  creatorChoice?: VoteOption;
}

export enum VoteOption {
  NONE,
  ABSTAIN,
  YEA,
  NAY,
}
