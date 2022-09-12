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
    grantAction: (params: IPermissionParams) => Promise<DaoAction>;
    revokeAction: (params: IPermissionParams) => Promise<DaoAction>;
    freezeAction: (params: IPermissionParams) => Promise<DaoAction>;
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
  permission: DaoPermissions;
}
export interface IFreezeParams {
  where: string;
  permission: DaoPermissions;
}

export enum DaoPermissions {
  UPGRADE_PERMISSION =
    "0xd5a14b802580ed4dd25c37f4587d65235454a7d1c553c5226e9ae8a88921c15d",
  SET_METADATA_PERMISSION =
    "0x4707e94b25cfce1a7c363508fbb838c35864388ad77284b248282b9746982b9b",
  EXECUTE_PERMISSION =
    "0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d",
  WITHDRAW_PERMISSION =
    "0xfa65bb7a7a179a721a21a3cefd5b633e9a9673e67b6319105b4d3d604c5bf92b",
  SET_SIGNATURE_VALIDATOR_PERMISSION =
    "0x0dcbfb19b09fb8ff4e9af583d4b8e9c8127cc1b26529b4d96dd3b7e778088372",
  SET_TRUSTED_FORWARDER_PERMISSION =
    "0x06d294bc8cbad2e393408b20dd019a772661f60b8d633e56761157cb1ec85f8c",
  ROOT_PERMISSION =
    "0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33",
  CREATE_VERSION_PERMISSION =
    "0xa49f10710df74c73f77df190e30f0261bc10b48204a5fe3a69bb75d970eefffd",
  MULTIPLY_PERMISSION =
    "0x293ab483515bb2dc32ac9b2dfb9c39ee4ea5571530c34de9864c3e5fa9ce787d",
  REGISTER_PERMISSION =
    "0xffb51f414ffad7ae6aa3ebe7a53cbd03087d492fd38b0f6cbaa8704085baac45",
  REGISTER_DAO_PERMISSION =
    "0xde5e253d6956bc5fb69cfa564733633f4e53b143e42859306cd13cdc54856215",
  REGISTER_ENS_SUBDOMAIN_PERMISSION =
    "0xbbdfd23f099d7ed9f535e0f97d2123efb1332b16e023b8359b3b879eaecd3c14",
  DO_SOMETHING_PERMISSION =
    "0xca54365909c5b14918df1fa69b5c0f4680039e920dbae56833063630e9e76f0e",
  ID_GATED_ACTION_PERMISSION =
    "0x13c93c3c138ff6cda03d08545766e5edbd7eaae2b4c303f9aefd54f1f178526c",
  MINT_PERMISSION =
    "0xb737b436e6cc542520cb79ec04245c720c38eebfa56d9e2d99b043979db20e4c",
  MERKLE_MINT_PERMISSION =
    "0x41f49f8a4bf63d8f5630a1a87118692c5e9c20298af5f644b801ec1cadb62630",
  MODIFY_ALLOWLIST_PERMISSION =
    "0x56c4199a7a444823a3bce5668e8272494ccbc2976f80f66082be8d7aa8d83569",
  SET_CONFIGURATION_PERMISSION =
    "0xa94344325e01133e91b3187f5f8c4287f020b72bf3447d70d16225953fbbd538",
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
