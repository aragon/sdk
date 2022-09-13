// This file contains the definitions of the general purpose DAO client

import { IClientCore } from "./core";
import {
  DaoAction,
  DaoRole,
  GasFeeEstimation,
  IInterfaceParams,
  IPagination,
  IPluginInstallItem,
} from "./common";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
/** Defines the shape of the general purpose Client class */
export interface IClient extends IClientCore {
  methods: {
    /** Created a DAO with the given parameters and plugins */
    create: (params: ICreateParams) => AsyncGenerator<DaoCreationStepValue>;
    /** Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet*/
    getBalances: (
      daoAddressOrEns: string,
      tokenAddresses: string[],
    ) => Promise<AssetBalance[]>;
    /** Retrieves the list of transfers from or to the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet*/
    getTransfers: (daoAddressOrEns: string) => Promise<IAssetTransfers>;
    /** Checks whether a role is granted by the current DAO's ACL settings */
    hasPermission: (
      where: string,
      who: string,
      role: DaoRole,
      data: Uint8Array,
    ) => Promise<void>;
    /** Deposits ether or an ERC20 token */
    deposit: (params: IDepositParams) => AsyncGenerator<DaoDepositStepValue>;
    /** Retrieves metadata for DAO with given identifier (address or ens domain)*/
    getDao: (daoAddressOrEns: string) => Promise<DaoDetails>;
    /** Retrieves metadata for many daos */
    getDaos: (params: IDaoQueryParams) => Promise<DaoListItem[]>;
  };
  encoding: {
    /** Computes the withdraw action payload */
    grantAction: (params: IPermissionParams) => DaoAction;
    revokeAction: (params: IPermissionParams) => DaoAction;
    freezeAction: (params: IPermissionParams) => DaoAction;
    withdrawAction: (
      daoAddresOrEns: string,
      params: IWithdrawParams,
    ) => Promise<DaoAction>;
    updateMetadataAction: (
      daoAddressOrEns: string,
      params: IMetadata,
    ) => Promise<DaoAction>;
  };
  decoding: {
    grantAction: (data: Uint8Array) => IPermissionParams;
    revokeAction: (data: Uint8Array) => IPermissionParams;
    freezeAction: (data: Uint8Array) => IFreezeParams;
    withdrawAction: (data: Uint8Array) => IWithdrawParams;
    updateMetadataRawAction: (data: Uint8Array) => string;
    updateMetadataAction: (data: Uint8Array) => Promise<IMetadata>;
    findInterface: (data: Uint8Array) => IInterfaceParams | null;
  };
  estimation: {
    create: (params: ICreateParams) => Promise<GasFeeEstimation>;
    deposit: (params: IDepositParams) => Promise<GasFeeEstimation>;
    updateAllowance: (params: IDepositParams) => Promise<GasFeeEstimation>;
  };
}

// DAO CREATION

/** Holds the parameters that the DAO will be created with */
export interface ICreateParams {
  metadata: IMetadata;
  ensSubdomain: string;
  plugins: IPluginInstallItem[];
}

export interface IMetadata {
  name: string;
  description: string;
  avatar: string;
  links: { name: string; url: string }[];
}

export interface IWithdrawParams {
  recipientAddress: string;
  amount: bigint;
  tokenAddress?: string;
  reference?: string;
}
export interface IPermissionParams {
  where: string;
  who: string;
  permission: string;
}
export interface IFreezeParams {
  where: string;
  permission: string;
}
const Permissions = {
  UPGRADE_PERMISSION: "UPGRADE_PERMISSION",
  SET_METADATA_PERMISSION: "SET_METADATA_PERMISSION",
  EXECUTE_PERMISSION: "EXECUTE_PERMISSION",
  WITHDRAW_PERMISSION: "WITHDRAW_PERMISSION",
  SET_SIGNATURE_VALIDATOR_PERMISSION: "SET_SIGNATURE_VALIDATOR_PERMISSION",
  SET_TRUSTED_FORWARDER_PERMISSION: "SET_TRUSTED_FORWARDER_PERMISSION",
  ROOT_PERMISSION: "ROOT_PERMISSION",
  CREATE_VERSION_PERMISSION: "CREATE_VERSION_PERMISSION",
  MULTIPLY_PERMISSION: "MULTIPLY_PERMISSION",
  REGISTER_PERMISSION: "REGISTER_PERMISSION",
  REGISTER_DAO_PERMISSION: "REGISTER_DAO_PERMISSION",
  REGISTER_ENS_SUBDOMAIN_PERMISSION: "REGISTER_ENS_SUBDOMAIN_PERMISSION",
  DO_SOMETHING_PERMISSION: "DO_SOMETHING_PERMISSION",
  ID_GATED_ACTION_PERMISSION: "ID_GATED_ACTION_PERMISSION",
  MINT_PERMISSION: "MINT_PERMISSION",
  MERKLE_MINT_PERMISSION: "MERKLE_MINT_PERMISSION",
  MODIFY_ALLOWLIST_PERMISSION: "MODIFY_ALLOWLIST_PERMISSION",
  SET_CONFIGURATION_PERMISSION: "SET_CONFIGURATION_PERMISSION",
};

const PermissionIds = Object.entries(Permissions).reduce(
  (acc, [k, v]) => ({ ...acc, [k + "_ID"]: keccak256(toUtf8Bytes(v)) }),
  {},
);
Object.freeze(Permissions);
export { Permissions };
Object.freeze(PermissionIds);
export { PermissionIds };

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

// Token types

type NativeTokenBase = {
  type: "native";
};
type Erc20TokenBase = {
  type: "erc20";
  /** The address of the token contract */
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

// Token balances

type NativeTokenBalance = NativeTokenBase & {
  balance: bigint;
};
type Erc20TokenBalance = Erc20TokenBase & {
  balance: bigint;
};

export type AssetBalance = (NativeTokenBalance | Erc20TokenBalance) & {
  lastUpdate: Date;
};

// Token transfers

type NativeTokenTransfer = NativeTokenBase & {
  amount: bigint;
  date: Date;
  reference: string;
  transactionId: string;
};

type Erc20TokenTransfer = Erc20TokenBase & {
  amount: bigint;
  date: Date;
  reference: string;
  transactionId: string;
};

export type AssetDeposit = (NativeTokenTransfer | Erc20TokenTransfer) & {
  from: string;
};

export type AssetWithdrawal = (NativeTokenTransfer | Erc20TokenTransfer) & {
  to: string;
};

export interface IAssetTransfers {
  deposits: AssetDeposit[];
  withdrawals: AssetWithdrawal[];
}

// DAO details

export type DaoResourceLink = { name: string; url: string };
export type InstalledPluginListItem = {
  id: string;
  instanceAddress: string;
  version: string;
};

export type DaoDetails = {
  address: string;
  ensDomain: string;
  metadata: {
    name: string;
    description: string;
    avatar?: string;
    links: DaoResourceLink[];
  };
  creationDate: Date;
  plugins: InstalledPluginListItem[];
};

export type DaoListItem = {
  address: string;
  ensDomain: string;
  metadata: {
    name: string;
    avatar?: string;
  };
  plugins: InstalledPluginListItem[];
};

export interface IDaoQueryParams extends IPagination {
  sortBy?: DaoSortBy;
}

export enum DaoSortBy {
  CREATED_AT,
  NAME,
  POPULARITY, // currently defined as number of proposals
}
