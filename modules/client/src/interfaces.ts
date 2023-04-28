// This file contains the definitions of the general purpose DAO client

import {
  DaoAction,
  GasFeeEstimation,
  IInterfaceParams,
  IPagination,
  IPluginInstallItem,
  Pagination,
} from "./client-common/interfaces/common";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { BigNumber } from "@ethersproject/bignumber";
import { IClientCore } from "./client-common/interfaces/core";
import {
  ApplyInstallationParams,
  DecodedApplyInstallationParams,
} from "./client-common";

/** Defines the shape of the general purpose Client class */
export interface IClientMethods extends IClientCore {
  createDao: (params: CreateDaoParams) => AsyncGenerator<DaoCreationStepValue>;
  pinMetadata: (params: DaoMetadata) => Promise<string>;
  /** Retrieves the asset balances of the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet*/
  getDaoBalances: (
    params: DaoBalancesQueryParams,
  ) => Promise<AssetBalance[] | null>;
  /** Retrieves the list of transfers from or to the given DAO, by default, ETH, DAI, USDC and USDT on Mainnet*/
  getDaoTransfers: (params: ITransferQueryParams) => Promise<Transfer[] | null>;
  /** Checks whether a role is granted by the current DAO's ACL settings */
  hasPermission: (params: IHasPermissionParams) => Promise<boolean>;
  /** Deposits ether or an ERC20 token */
  deposit: (
    params: DepositParams,
  ) => AsyncGenerator<DaoDepositStepValue>;
  /** Retrieves metadata for DAO with given identifier (address or ens domain)*/
  setAllowance: (
    params: SetAllowanceParams,
  ) => AsyncGenerator<SetAllowanceStepValue>;
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
  grantWithConditionAction: (
    daoAddress: string,
    params: GrantPermissionWithConditionParams,
  ) => DaoAction;
  revokeAction: (
    daoAddress: string,
    params: IRevokePermissionParams,
  ) => DaoAction;
  withdrawAction: (
    parameters: WithdrawParams,
  ) => Promise<DaoAction>;
  updateDaoMetadataAction: (
    daoAddressOrEns: string,
    metadataUri: string,
  ) => Promise<DaoAction>;
  setDaoUriAction: (
    daoAddressOrEns: string,
    daoUri: string,
  ) => DaoAction;
  registerStandardCallbackAction: (
    daoAddressOrEns: string,
    params: RegisterStandardCallbackParams,
  ) => DaoAction;
  setSignatureValidatorAction: (
    daoAddressOrEns: string,
    signatureValidator: string,
  ) => DaoAction;
  upgradeToAction: (
    daoAddressOrEns: string,
    implementationAddress: string,
  ) => DaoAction;
  upgradeToAndCallAction: (
    daoAddressOrEns: string,
    params: UpgradeToAndCallParams,
  ) => DaoAction;
  applyInstallationAction: (
    daoAddressOrEns: string,
    params: ApplyInstallationParams,
  ) => DaoAction[];
}

export interface IClientDecoding {
  grantAction: (data: Uint8Array) => IGrantPermissionDecodedParams;
  grantWithConditionAction: (
    data: Uint8Array,
  ) => GrantPermissionWithConditionParams;
  revokeAction: (data: Uint8Array) => IRevokePermissionDecodedParams;
  withdrawAction: (
    to: string,
    value: bigint,
    data: Uint8Array,
  ) => WithdrawParams;
  updateDaoMetadataRawAction: (data: Uint8Array) => string;
  updateDaoMetadataAction: (data: Uint8Array) => Promise<DaoMetadata>;
  setDaoUriAction: (data: Uint8Array) => string;
  registerStandardCallbackAction: (
    data: Uint8Array,
  ) => RegisterStandardCallbackParams;
  setSignatureValidatorAction: (data: Uint8Array) => string;
  upgradeToAction: (data: Uint8Array) => string;
  upgradeToAndCallAction: (data: Uint8Array) => UpgradeToAndCallParams;
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
  applyInstallationAction: (
    data: Uint8Array,
  ) => DecodedApplyInstallationParams;
}

export interface IClientEstimation {
  createDao: (params: CreateDaoParams) => Promise<GasFeeEstimation>;
  deposit: (
    params: DepositParams,
  ) => Promise<GasFeeEstimation>;
  setAllowance: (params: SetAllowanceParams) => Promise<GasFeeEstimation>;
}

export interface IClient {
  methods: IClientMethods;
  encoding: IClientEncoding;
  decoding: IClientDecoding;
  estimation: IClientEstimation;
}

// DAO CREATION

/** Holds the parameters that the DAO will be created with */
export type CreateDaoParams = {
  metadataUri: string;
  daoUri?: string;
  ensSubdomain: string;
  trustedForwarder?: string;
  plugins: IPluginInstallItem[];
};

export type DaoMetadata = {
  name: string;
  description: string;
  avatar?: string;
  links: DaoResourceLink[];
};

// Withdrawals
type WithdrawParamsBase = {
  type: TokenType;
  recipientAddressOrEns: string;
};

type WithdrawEthParams = WithdrawParamsBase & {
  type: TokenType.NATIVE;
  amount: bigint;
};
type WithdrawErc20Params = WithdrawParamsBase & {
  type: TokenType.ERC20;
  amount: bigint;
  tokenAddress: string;
};

export type WithdrawParams = WithdrawEthParams | WithdrawErc20Params;

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

export type PermisionParamsBase = {
  where: string;
  who: string;
  permission: string;
};

export type GrantPermissionWithConditionParams = PermisionParamsBase & {
  condition: string;
};
export type GrantPermissionWithConditionDecodedParams = PermisionParamsBase & {
  condition: string;
  permissionId: string;
};

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
  | { key: DaoCreationSteps.DONE; address: string; pluginAddresses: string[] };

// DEPOSIT

export type DepositBaseParams = {
  daoAddressOrEns: string;
};

export type DepositEthParams = DepositBaseParams & {
  type: TokenType.NATIVE;
  amount: bigint;
};
export type DepositErc20Params = DepositBaseParams & {
  type: TokenType.ERC20;
  tokenAddress: string;
  amount: bigint;
};
// export type DepositErc721Params = DepositBaseParams & {
//   type: TokenType.ERC721;
//   tokenAddress: string;
// };

export type DepositParams = DepositEthParams | DepositErc20Params; // | DepositErc721Params;

export type SetAllowanceParams = {
  spender: string;
  amount: bigint;
  tokenAddress: string;
};

export enum DaoDepositSteps {
  CHECKED_ALLOWANCE = "checkedAllowance",
  DEPOSITING = "depositing",
  DONE = "done",
}

export enum SetAllowanceSteps {
  SETTING_ALLOWANCE = "settingAllowance",
  ALLOWANCE_SET = "allowanceSet",
}

export type SetAllowanceStepValue =
  | { key: SetAllowanceSteps.SETTING_ALLOWANCE; txHash: string }
  | { key: SetAllowanceSteps.ALLOWANCE_SET; allowance: bigint };

export type DaoDepositStepValue =
  | SetAllowanceStepValue
  | { key: DaoDepositSteps.CHECKED_ALLOWANCE; allowance: bigint }
  | { key: DaoDepositSteps.DEPOSITING; txHash: string }
  | { key: DaoDepositSteps.DONE; amount: bigint };

// Token balances

type AssetBalanceBase = {
  address: string;
  name: string;
  symbol: string;
  updateDate: Date;
};

type NativeAssetBalance = {
  type: TokenType.NATIVE;
  balance: bigint;
  updateDate: Date;
};
type Erc20AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC20;
  balance: bigint;
  decimals: number;
};
type Erc721AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC721;
};

export type AssetBalance =
  | NativeAssetBalance
  | Erc20AssetBalance
  | Erc721AssetBalance;

// Token transfers
export enum TransferType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}
export enum TokenType {
  NATIVE = "native",
  ERC20 = "erc20",
  ERC721 = "erc721",
}

type BaseTokenTransfer = {
  creationDate: Date;
  transactionId: string;
  to: string;
  from: string;
};

type NativeTokenTransfer = BaseTokenTransfer & {
  tokenType: TokenType.NATIVE;
  amount: bigint;
};

type Erc721TokenTransfer = BaseTokenTransfer & {
  tokenType: TokenType.ERC721;
  token: {
    address: string;
    name: string;
    symbol: string;
  };
};

type Erc20TokenTransfer = BaseTokenTransfer & {
  tokenType: TokenType.ERC20;
  amount: bigint;
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
};

export type Deposit =
  & (NativeTokenTransfer | Erc20TokenTransfer | Erc721TokenTransfer)
  & {
    type: TransferType.DEPOSIT;
  };

export type Withdraw =
  & (NativeTokenTransfer | Erc20TokenTransfer | Erc721TokenTransfer)
  & {
    type: TransferType.WITHDRAW;
    proposalId: string;
  };

export type Transfer = Deposit | Withdraw;

export type RegisterStandardCallbackParams = {
  interfaceId: string;
  callbackSelector: string;
  magicNumber: string;
};

export type UpgradeToAndCallParams = {
  implementationAddress: string;
  data: Uint8Array;
};

// DAO details

export type DaoResourceLink = { name: string; url: string };
export type InstalledPluginListItem = {
  id: string;
  instanceAddress: string;
  release: number;
  build: number;
};

export type DaoDetails = {
  address: string;
  ensDomain: string;
  metadata: DaoMetadata;
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
  CREATED_AT = "createdAt",
}

export type DaoBalancesQueryParams = Pagination & {
  sortBy?: AssetBalanceSortBy;
  daoAddressOrEns?: string;
};
export enum AssetBalanceSortBy {
  LAST_UPDATED = "lastUpdated",
}

export enum DaoSortBy {
  CREATED_AT = "createdAt",
  SUBDOMAIN = "subdomain",
  // POPULARITY = "totalProposals", // currently defined as number of proposals
}



export type SubgraphPluginListItem = {
  id: string;
  installations: {
    appliedVersion: {
      pluginRepo: {
        subdomain: string
      }
      build: number;
      release: {
        release: number;
      };
    };
  }[];
};

type SubgraphDaoBase = {
  id: string;
  subdomain: string;
  metadata: string;
  plugins: SubgraphPluginListItem[];
};

export type SubgraphDao = SubgraphDaoBase & {
  createdAt: string;
};

export type SubgraphDaoListItem = SubgraphDaoBase;

export type SubgraphBalance = {
  __typename: string;
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  balance: string;
  lastUpdated: string;
};

export enum SubgraphTransferType {
  DEPOSIT = "Deposit",
  WITHDRAW = "Withdraw",
}

export type SubgraphTransferListItem = {
  from: string;
  to: string;
  type: SubgraphTransferType;
  createdAt: string;
  txHash: string;
  proposal: {
    id: string | null;
  };
  amount: string;
  token: SubgraphToken;
  __typename: string;
};

export type SubgraphToken = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
};
export const SubgraphTransferTypeMap: Map<
  TransferType,
  SubgraphTransferType
> = new Map([
  [TransferType.DEPOSIT, SubgraphTransferType.DEPOSIT],
  [TransferType.WITHDRAW, SubgraphTransferType.WITHDRAW],
]);

export type ContractPermissionParams = [string, string, string];
export type ContractPermissionWithConditionParams = [
  string,
  string,
  string,
  string,
];
export type ContractWithdrawParams = [string, string, BigNumber, string];
