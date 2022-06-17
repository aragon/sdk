// This file contains common types and enumerations

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
