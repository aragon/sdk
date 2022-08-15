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
export interface IPluginListItem {
  id: string // ENS domain or address of the plugin's Repo
  data: Uint8Array
}

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
  creatorAddress: string;

  // date
  endDate: Date;
  startDate: Date;
  creationDate: Date;

  // metadata
  title: string;
  summary: string;
  description: string;
  resources: { url: string; description: string }[];

  actions?: DaoAction[];
  status: ProposalStatus;
};

export interface IPagination {
  skip?: number
  limit?: number
  direction?: SortDirection
}

export enum SortDirection {
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

