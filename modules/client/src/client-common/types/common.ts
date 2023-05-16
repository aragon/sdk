export const SupportedNetworksArray = [
  "homestead",
  "goerli",
  "matic",
  "maticmum",
] as const;
export type SupportedNetwork = typeof SupportedNetworksArray[number];
export type NetworkDeployment = {
  daoFactory: string;
  pluginSetupProcessor: string;
  multisigRepo: string;
  adminRepo: string;
  addresslistVotingRepo: string;
  tokenVotingRepo: string;
  multisigSetup: string;
  adminSetup: string;
  addresslistVotingSetup: string;
  tokenVotingSetup: string;
  ensRegistry?: string;
};

// This file contains common types, interfaces, and enumerations

export enum DaoRole {
  UPGRADE_ROLE = "UPGRADE_ROLE",
  DAO_CONFIG_ROLE = "DAO_CONFIG_ROLE",
  EXEC_ROLE = "EXEC_ROLE",
  WITHDRAW_ROLE = "WITHDRAW_ROLE",
  SET_SIGNATURE_VALIDATOR_ROLE = "SET_SIGNATURE_VALIDATOR_ROLE",
}

/**
 * Contains the payload passed to the global DAO factory so that
 * plugins can be initialized
 */
export interface PluginInstallItem {
  id: string; // ENS domain or address of the plugin's Repo
  data: Uint8Array;
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
 * Contains the general human readable information about the DAO
 */
export type DaoConfig = {
  name: string;
  metadataUri: string;
};

export type GasFeeEstimation = {
  average: bigint;
  max: bigint;
};

export interface IPagination {
  skip?: number;
  limit?: number;
  direction?: SortDirection;
}

export type Pagination = {
  skip?: number;
  limit?: number;
  direction?: SortDirection;
};

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export interface InterfaceParams {
  id: string;
  functionName: string;
  hash: string;
}

export enum TokenType {
  NATIVE = "native",
  ERC20 = "erc20",
  ERC721 = "erc721",
}