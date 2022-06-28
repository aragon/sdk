// This file contains the definitions of the general purpose DAO client

import { IClientCore } from "./core";
import { DaoConfig, DaoRole, GasFeeEstimation } from "./common";

/** Defines the shape of the general purpose Client class */
export interface IClient extends IClientCore {
  methods: {
    /** Created a DAO with the given parameters and plugins */
    create: (params: ICreateParams) => AsyncGenerator<DaoCreationStepValue>;
    /** Checks whether a role is granted by the current DAO's ACL settings */
    hasPermission: (
      where: string,
      who: string,
      role: DaoRole,
      data: Uint8Array
    ) => Promise<void>;
    /** Deposits ether or an ERC20 token */
    deposit: (params: IDepositParams) => AsyncGenerator<DaoDepositStepValue>;
    /** Retrieves metadata for DAO with given identifier*/
    getDaoMetadata: (daoIdentifier: string) => Promise<DaoMetadata>;
  };
  estimation: {
    create: (params: ICreateParams) => Promise<GasFeeEstimation>;
    deposit: (params: IDepositParams) => Promise<GasFeeEstimation>;
  };
}

// DAO CREATION

/** Holds the parameters that the DAO will be created with */
export interface ICreateParams {
  daoConfig: DaoConfig;
  gsnForwarder?: string;

  // TODO: Support an array of package + parameters to install
  plugins: IPluginFactoryParams[];
}

/** Holds the parameters passed to a Plugin factory when creating a DAO or installing a plugin */
export interface IPluginFactoryParams {
  id: string;
  data: string;
}

export enum DaoCreationSteps {
  CREATING = "creating",
  DONE = "done",
}

export type DaoCreationStepValue =
  | { key: DaoCreationSteps.CREATING; txHash: string }
  | { key: DaoCreationSteps.DONE; address: string };

// DEPOSIT

export interface IDepositParams {
  daoAddress: string;
  amount: bigint;
  tokenAddress?: string;
  reference?: string;
}

export enum DaoDepositSteps {
  CHECKED_ALLOWANCE = "checkedAllowance",
  UPDATING_ALLOWANCE = "updatingAllowance",
  UPDATED_ALLOWANCE = "updatedAllowance",
  DEPOSITING = "depositing",
  DONE = "done",
}

export type DaoDepositStepValue =
  | { key: DaoDepositSteps.CHECKED_ALLOWANCE; allowance: bigint }
  | { key: DaoDepositSteps.UPDATING_ALLOWANCE; txHash: string }
  | { key: DaoDepositSteps.UPDATED_ALLOWANCE; allowance: bigint }
  | { key: DaoDepositSteps.DEPOSITING; txHash: string }
  | { key: DaoDepositSteps.DONE; amount: bigint };

// DAO DETAILS
export type DaoResourceLink = { label: string; url: string };

export type DaoToken = {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
};

export type DaoMetadata = {
  address: string;
  avatar?: string;
  createdAt: number;
  description: string;
  links?: DaoResourceLink[];
  name: string;
  packages: string[];
  token: DaoToken;
};
