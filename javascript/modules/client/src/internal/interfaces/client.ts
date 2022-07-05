// This file contains the definitions of the general purpose DAO client

import { IClientCore } from "./core";
import { DaoConfig, DaoRole, GasFeeEstimation } from "./common";

/** Defines the shape of the general purpose Client class */
export interface IClient extends IClientCore {
  methods: {
    /** Created a DAO with the given parameters and plugins */
    create: (params: ICreateParams) => AsyncGenerator<DaoCreationStepValue>;
    /** Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet*/
    getBalances: (daoAddressOrEns: string) => Promise<TokenBalance[]>;
    /** Retrieves the list of transfers from or to the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet*/
    getTransfers: (daoAddressOrEns: string) => Promise<IDaoTransfers>;
    /** Checks whether a role is granted by the curren DAO's ACL settings */
    hasPermission: (
      where: string,
      who: string,
      role: DaoRole,
      data: Uint8Array
    ) => Promise<void>;
    /** Deposits ether or an ERC20 token */
    deposit: (params: IDepositParams) => AsyncGenerator<DaoDepositStepValue>;
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
  INCREASING_ALLOWANCE = "increasingAllowance",
  INCREASED_ALLOWANCE = "increasedAllowance",
  DEPOSITING = "depositing",
  DONE = "done",
}

export type DaoDepositStepValue =
  | { key: DaoDepositSteps.CHECKED_ALLOWANCE; allowance: bigint }
  | { key: DaoDepositSteps.INCREASING_ALLOWANCE; txHash: string }
  | { key: DaoDepositSteps.INCREASED_ALLOWANCE; allowance: bigint }
  | { key: DaoDepositSteps.DEPOSITING; txHash: string }
  | { key: DaoDepositSteps.DONE; amount: bigint };

export type TokenBalance = {
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
  };
  balance: bigint;
  lastUpdate: string;
};

/** The Dao transfer */
export type DaoTransfer = {
  amount: bigint;
  createdAt: string;
  token: TokenBalance["token"];
  address: string;
  reference: string;
  transaction: string;
};
export interface IDaoTransfers {
  deposits: DaoTransfer[];
  withdrawals: DaoTransfer[];
}
