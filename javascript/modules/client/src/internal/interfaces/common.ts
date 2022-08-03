// This file contains common types, interfaces, and enumerations

export enum DaoRole {
  UPGRADE_ROLE = "UPGRADE_ROLE",
  DAO_CONFIG_ROLE = "DAO_CONFIG_ROLE",
  EXEC_ROLE = "EXEC_ROLE",
  WITHDRAW_ROLE = "WITHDRAW_ROLE",
  SET_SIGNATURE_VALIDATOR_ROLE = "SET_SIGNATURE_VALIDATOR_ROLE",
}

/**
 * Contains the payload passed to governance contracts, serializing
 * the actions to do upon approval
 */
export type DaoAction = {
  to: string;
  value: bigint;
  data: Uint8Array;
};

/**
 * Contains the payload passed to the global DAO factory so that
 * plugins can be initialized
 */
export type FactoryInitParams = {
  /** The ID of the plugin to use */
  id: string;
  /** ABI encoded parameters to pass to the plugin factory */
  data: Uint8Array;
};

/**
 * Contains the general human readable information about the DAO
 */
export type DaoConfig = {
  name: string;
  metadata: string;
};

export type GasFeeEstimation = {
  average: bigint;
  max: bigint;
};

/**
 * Contains the base structure of a proposal
 */
export type Proposal = {
  id: string;
  daoAddress: string;
  daoName: string;
  creator: string;

  // date
  endDate: Date;
  startDate: Date;
  createdAt: Date;

  // metadata
  title: string;
  summary: string;
  proposal: string;
  resources: { url: string; description: string }[];

  actions?: DaoAction[];
  status: ProposalStatus;
};

export interface IPagination {
  skip?: number
  limit?: number
  sortDirection?: SortDireccions
}

export enum SortDireccions {
  ASC = "asc",
  DESC = "desc"
}

/**
 * Contains the states of a proposal. Note that on chain
 * proposals cannot be in draft state
 */
export enum ProposalStatus {
  ACTIVE = "Active",
  PENDING = "Pending",
  SUCCEEDED = "Succeeded",
  EXECUTED = "Executed",
  DEFEATED = "Defeated",
}

