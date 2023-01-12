// This file contains the definitions of the general purpose DAO client

import {
  DaoAction,
  GasFeeEstimation,
  IInterfaceParams,
  IPagination,
  IPluginInstallItem,
} from "./client-common/interfaces/common";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { BigNumber } from "@ethersproject/bignumber";
import { IClientCore } from "./client-common/interfaces/core";
/** Defines the shape of the general purpose Client class */
export interface IClientMethods extends IClientCore {
  create: (params: ICreateParams) => AsyncGenerator<DaoCreationStepValue>;
  pinMetadata: (params: IMetadata) => Promise<string>;
  /** Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet*/
  getBalances: (
    daoAddressOrEns: string,
  ) => Promise<AssetBalance[] | null>;
  /** Retrieves the list of transfers from or to the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet*/
  getTransfers: (params: ITransferQueryParams) => Promise<Transfer[] | null>;
  /** Checks whether a role is granted by the current DAO's ACL settings */
  hasPermission: (params: IHasPermissionParams) => Promise<boolean>;
  /** Deposits ether or an ERC20 token */
  deposit: (params: IDepositParams) => AsyncGenerator<DaoDepositStepValue>;
  /** Retrieves metadata for DAO with given identifier (address or ens domain)*/
  ensureAllowance: (
    params: EnsureAllowanceParams,
  ) => AsyncGenerator<EnsureAllowanceStepValue>;
  /** Retrieves metadata for DAO with given identifier (address or ens domain)*/
  getDao: (daoAddressOrEns: string) => Promise<DaoDetails | null>;
  /** Retrieves metadata for many daos */
  getDaos: (params: IDaoQueryParams) => Promise<DaoListItem[]>;
}

export interface IClientEncoding extends IClientCore {
  grantAction: (
    daoAddress: string,
    params: IGrantPermissionParams,
  ) => DaoAction;
  revokeAction: (
    daoAddress: string,
    params: IRevokePermissionParams,
  ) => DaoAction;
  freezeAction: (
    daoAddress: string,
    params: IFreezePermissionParams,
  ) => DaoAction;
  withdrawAction: (
    daoAddresOrEns: string,
    params: IWithdrawParams,
  ) => Promise<DaoAction>;
  updateMetadataAction: (
    daoAddressOrEns: string,
    metadataUri: string,
  ) => Promise<DaoAction>;
}

export interface IClientDecoding {
  grantAction: (data: Uint8Array) => IGrantPermissionDecodedParams;
  revokeAction: (data: Uint8Array) => IRevokePermissionDecodedParams;
  freezeAction: (data: Uint8Array) => IFreezePermissionDecodedParams;
  withdrawAction: (data: Uint8Array) => IWithdrawParams;
  updateMetadataRawAction: (data: Uint8Array) => string;
  updateMetadataAction: (data: Uint8Array) => Promise<IMetadata>;
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
}

export interface IClientEstimation {
  create: (params: ICreateParams) => Promise<GasFeeEstimation>;
  deposit: (params: IDepositParams) => Promise<GasFeeEstimation>;
  updateAllowance: (params: IDepositParams) => Promise<GasFeeEstimation>;
}

export interface IClient {
  methods: IClientMethods;
  encoding: IClientEncoding;
  decoding: IClientDecoding;
  estimation: IClientEstimation;
}

// DAO CREATION

/** Holds the parameters that the DAO will be created with */
export interface ICreateParams {
  metadataUri: string;
  ensSubdomain: string;
  trustedForwarder?: string;
  plugins: IPluginInstallItem[];
}

export interface IMetadata {
  name: string;
  description: string;
  avatar?: string;
  links: DaoResourceLink[];
}

export interface IWithdrawParams {
  recipientAddress: string;
  amount: bigint;
  tokenAddress?: string;
  reference?: string;
}
interface IPermissionParamsBase {
  where: string;
  who: string;
  permission: string;
}
interface IPermissionDecodedParamsBase extends IPermissionParamsBase {
  permissionId: string;
}
export interface IGrantPermissionParams extends IPermissionParamsBase {}
export interface IRevokePermissionParams extends IPermissionParamsBase {}
export interface IGrantPermissionDecodedParams
  extends IPermissionDecodedParamsBase {}
export interface IRevokePermissionDecodedParams
  extends IPermissionDecodedParamsBase {}
export interface IFreezePermissionParams {
  where: string;
  permission: string;
}
export interface IFreezePermissionDecodedParams
  extends IFreezePermissionParams {
  permissionId: string;
}

export interface IHasPermissionParams {
  daoAddressOrEns: string;
  where: string;
  who: string;
  permission: string; // permission name
  data?: Uint8Array;
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
  REGISTER_PERMISSION: "REGISTER_PERMISSION",
  REGISTER_DAO_PERMISSION: "REGISTER_DAO_PERMISSION",
  REGISTER_ENS_SUBDOMAIN_PERMISSION: "REGISTER_ENS_SUBDOMAIN_PERMISSION",
  MINT_PERMISSION: "MINT_PERMISSION",
  MERKLE_MINT_PERMISSION: "MERKLE_MINT_PERMISSION",
  MODIFY_ALLOWLIST_PERMISSION: "MODIFY_ALLOWLIST_PERMISSION",
  SET_CONFIGURATION_PERMISSION: "SET_CONFIGURATION_PERMISSION",
};

const PermissionIds = Object.entries(Permissions).reduce(
  (acc, [k, v]) => ({ ...acc, [k + "_ID"]: keccak256(toUtf8Bytes(v)) }),
  {} as { [k: string]: string },
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
  daoAddressOrEns: string;
  amount: bigint;
  tokenAddress?: string;
  reference?: string;
}

export type EnsureAllowanceParams = {
  daoAddress: string;
  amount: bigint;
  tokenAddress: string;
};

export enum DaoDepositSteps {
  CHECKED_ALLOWANCE = "checkedAllowance",
  UPDATING_ALLOWANCE = "updatingAllowance",
  UPDATED_ALLOWANCE = "updatedAllowance",
  DEPOSITING = "depositing",
  DONE = "done",
}
export type EnsureAllowanceStepValue =
  | { key: DaoDepositSteps.CHECKED_ALLOWANCE; allowance: bigint }
  | { key: DaoDepositSteps.UPDATING_ALLOWANCE; txHash: string }
  | { key: DaoDepositSteps.UPDATED_ALLOWANCE; allowance: bigint };

export type DaoDepositStepValue =
  | EnsureAllowanceStepValue
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
  updateDate: Date;
};

// Token transfers
export enum TransferType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}
export enum TokenType {
  NATIVE = "native",
  ERC20 = "erc20",
}

type BaseTokenTransfer = {
  amount: bigint;
  creationDate: Date;
  reference: string;
  transactionId: string;
};

type NativeTokenTransfer = BaseTokenTransfer & {
  tokenType: TokenType.NATIVE;
};

type Erc20TokenTransfer = BaseTokenTransfer & {
  tokenType: TokenType.ERC20;
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
};

export type Deposit = (NativeTokenTransfer | Erc20TokenTransfer) & {
  from: string;
  type: TransferType.DEPOSIT;
};

export type Withdraw = (NativeTokenTransfer | Erc20TokenTransfer) & {
  to: string;
  type: TransferType.WITHDRAW;
  proposalId: string;
};

export type Transfer = Deposit | Withdraw;

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
  metadata: IMetadata;
  creationDate: Date;
  plugins: InstalledPluginListItem[];
};

export type DaoListItem = {
  address: string;
  ensDomain: string;
  metadata: {
    name: string;
    description: string;
    avatar?: string;
  };
  plugins: InstalledPluginListItem[];
};

export interface IDaoQueryParams extends IPagination {
  sortBy?: DaoSortBy;
}
export interface ITransferQueryParams extends IPagination {
  sortBy?: TransferSortBy;
  type?: TransferType;
  daoAddressOrEns?: string;
}

export enum TransferSortBy {
  CREATED_AT = "createdAt", // currently defined as number of proposals
}

export enum DaoSortBy {
  CREATED_AT = "createdAt",
  NAME = "name",
  POPULARITY = "totalProposals", // currently defined as number of proposals
}

export enum SubgraphPluginTypeName {
  TOKEN_VOTING = "TokenVotingPlugin",
  ADDRESS_LIST = "AddresslistVotingPlugin",
  ADMIN = "AdminPlugin",
  MULTISIG = "MultisigPlugin",
}

export const SubgraphPluginTypeMap: Map<
  SubgraphPluginTypeName,
  string
> = new Map([
  [SubgraphPluginTypeName.TOKEN_VOTING, "token-voting.plugin.dao.eth"],
  [SubgraphPluginTypeName.ADDRESS_LIST, "addresslist-voting.plugin.dao.eth"],
  [SubgraphPluginTypeName.ADMIN, "admin.plugin.dao.eth"],
  [SubgraphPluginTypeName.MULTISIG, "multisig.plugin.dao.eth"],
]);

export type SubgraphPluginListItem = {
  plugin: {
    id: string;
    __typename: SubgraphPluginTypeName;
  };
};

type SubgraphDaoBase = {
  id: string;
  name: string;
  metadata: string;
  plugins: SubgraphPluginListItem[];
};

export type SubgraphDao = SubgraphDaoBase & {
  createdAt: string;
};

export type SubgraphDaoListItem = SubgraphDaoBase;

export type SubgraphBalance = {
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  };
  balance: string;
  lastUpdated: string;
};

export enum SubgraphTransferType {
  DEPOSIT = "Deposit",
  WITHDRAW = "Withdraw",
}

export type SubgraphTransferListItem = {
  amount: string;
  createdAt: string;
  reference: string;
  transaction: string;
  type: SubgraphTransferType;
  to: string;
  sender: string;
  token: SubgraphToken;
  proposal: {
    id: string | null;
  };
};

export type SubgraphToken = {
  id: string;
  name: string;
  symbol: string;
  decimals: string;
};
export const SubgraphTransferTypeMap: Map<
  TransferType,
  SubgraphTransferType
> = new Map([
  [TransferType.DEPOSIT, SubgraphTransferType.DEPOSIT],
  [TransferType.WITHDRAW, SubgraphTransferType.WITHDRAW],
]);

export type ContractFreezeParams = [string, string];
export type ContractPermissionParams = [string, string, string];
export type ContractWithdrawParams = [string, string, BigNumber, string];
