import {
  DaoAction,
  MetadataAbiInput,
  Pagination,
  PluginInstallItem,
  TokenType,
  VersionTag,
} from "@aragon/sdk-client-common";

/* DAO creation */
export type CreateDaoParams = {
  metadataUri: string;
  daoUri?: string;
  ensSubdomain?: string;
  trustedForwarder?: string;
  plugins: PluginInstallItem[];
};

export enum DaoCreationSteps {
  CREATING = "creating",
  DONE = "done",
}

export type DaoCreationStepValue =
  | { key: DaoCreationSteps.CREATING; txHash: string }
  | { key: DaoCreationSteps.DONE; address: string; pluginAddresses: string[] };

/* DAOs */
export type DaoResourceLink = { name: string; url: string };
export type DaoMetadata = {
  name: string;
  description: string;
  avatar?: string;
  links: DaoResourceLink[];
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

export type DaoQueryParams = Pagination & {
  sortBy?: DaoSortBy;
};

export enum DaoSortBy {
  CREATED_AT = "createdAt",
  SUBDOMAIN = "subdomain",
  // POPULARITY = "totalProposals", // currently defined as number of proposals
}

/* Plugins */

export type InstalledPluginListItem = {
  id: string;
  instanceAddress: string;
  release: number;
  build: number;
};

export enum PluginSortBy {
  SUBDOMAIN = "subdomain",
}

export type PluginQueryParams = Pagination & {
  sortBy?: PluginSortBy;
  subdomain?: string;
};

/* Plugin repos */

export type PluginRepoReleaseMetadata = {
  name: string;
  description: string;
  images: Object; // TODO specify parameters
};

export type PluginRepoBuildMetadata = {
  ui: string;
  change: string;
  pluginSetup: {
    prepareInstallation: string[];
    prepareUpdate: {
      [key: number]: {
        description: string;
        inputs: MetadataAbiInput[];
      };
    };
    prepareUninstallation: string[];
  };
};

export type PluginRepoCurrent = {
  build: {
    number: number;
    metadata: PluginRepoBuildMetadata;
  };
  release: {
    number: number;
    metadata: PluginRepoReleaseMetadata;
  };
};

type PluginRepoBase = {
  address: string;
  subdomain: string;
  current: PluginRepoCurrent;
  releases: PluginRepoRelease[];
};

type PluginRepoRelease = {
  release: number;
  metadata: string;
  builds: PluginRepoBuild[];
};

type PluginRepoBuild = {
  build: number;
  metadata: string;
};
export type PluginRepo = PluginRepoBase;
export type PluginRepoListItem = PluginRepoBase;

/* Deposits */
type DepositBaseParams = {
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
export type DepositErc721Params = DepositBaseParams & {
  type: TokenType.ERC721;
  tokenAddress: string;
  tokenId: bigint;
};

export type DepositErc1155Params = DepositBaseParams & {
  type: TokenType.ERC1155;
  tokenAddress: string;
  tokenIds: bigint[];
  amounts: bigint[];
};

export type DepositParams =
  | DepositEthParams
  | DepositErc20Params
  | DepositErc721Params
  | DepositErc1155Params;

export enum DaoDepositSteps {
  CHECKED_ALLOWANCE = "checkedAllowance",
  DEPOSITING = "depositing",
  DONE = "done",
}

export type DaoDepositStepValue =
  | SetAllowanceStepValue
  | { key: DaoDepositSteps.CHECKED_ALLOWANCE; allowance: bigint }
  | { key: DaoDepositSteps.DEPOSITING; txHash: string }
  | {
    key: DaoDepositSteps.DONE;
    amount?: bigint;
    tokenId?: bigint;
    tokenIds?: bigint[];
    amounts?: bigint[];
  };

/* Withdrawals */
type WithdrawParamsBase = {
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

type WithdrawErc721Params = WithdrawParamsBase & {
  type: TokenType.ERC721;
  tokenAddress: string;
  tokenId: bigint;
  daoAddressOrEns: string;
};

type WithdrawErc1155Params = WithdrawParamsBase & {
  type: TokenType.ERC1155;
  daoAddressOrEns: string;
  tokenAddress: string;
  tokenIds: bigint[];
  amounts: bigint[];
};

export type WithdrawParams =
  | WithdrawEthParams
  | WithdrawErc20Params
  | WithdrawErc721Params
  | WithdrawErc1155Params;

/* Balances */
type AssetBalanceBase = {
  id: string;
  address: string;
  updateDate: Date;
};

type NativeAssetBalance = {
  id: string;
  type: TokenType.NATIVE;
  balance: bigint;
  updateDate: Date;
};
type Erc20AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC20;
  balance: bigint;
  decimals: number;
  name: string;
  symbol: string;
};
type Erc721AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC721;
  tokenIds: bigint[];
  name: string;
  symbol: string;
};

type Erc1155AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC1155;
  balances: {
    id: string;
    tokenId: bigint;
    amount: bigint;
  }[];
  metadataUri: string;
};

export type DaoBalancesQueryParams = Pagination & {
  sortBy?: AssetBalanceSortBy;
  daoAddressOrEns?: string;
};
export enum AssetBalanceSortBy {
  LAST_UPDATED = "lastUpdated",
}

export type AssetBalance =
  | NativeAssetBalance
  | Erc20AssetBalance
  | Erc721AssetBalance
  | Erc1155AssetBalance;

/* Transfers */

type TokenTransferBase = {
  creationDate: Date;
  transactionId: string;
  to: string;
  from: string;
};

type TokenBase = {
  address: string;
  name: string;
  symbol: string;
};

type NativeTokenTransfer = TokenTransferBase & {
  tokenType: TokenType.NATIVE;
  amount: bigint;
};

type Erc721TokenTransfer = TokenTransferBase & {
  tokenType: TokenType.ERC721;
  token: TokenBase;
};

type Erc20TokenTransfer = TokenTransferBase & {
  tokenType: TokenType.ERC20;
  amount: bigint;
  token: TokenBase & {
    decimals: number;
  };
};

type Erc1155TokenTransfer = TokenTransferBase & {
  tokenType: TokenType.ERC1155;
  tokenId: bigint;
  token: {
    address: string;
  };
  amount: bigint;
};

export enum TransferType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

export type Deposit =
  & (
    | NativeTokenTransfer
    | Erc20TokenTransfer
    | Erc721TokenTransfer
    | Erc1155TokenTransfer
  )
  & {
    type: TransferType.DEPOSIT;
  };

export type Withdraw =
  & (
    | NativeTokenTransfer
    | Erc20TokenTransfer
    | Erc721TokenTransfer
    | Erc1155TokenTransfer
  )
  & {
    type: TransferType.WITHDRAW;
    proposalId: string;
  };

export type TransferQueryParams = Pagination & {
  sortBy?: TransferSortBy;
  type?: TransferType;
  daoAddressOrEns?: string;
};
export enum TransferSortBy {
  CREATED_AT = "createdAt",
}

export type Transfer = Deposit | Withdraw;

/* Allowance */
export type SetAllowanceParams = {
  spender: string;
  amount: bigint;
  tokenAddress: string;
};

export enum SetAllowanceSteps {
  SETTING_ALLOWANCE = "settingAllowance",
  ALLOWANCE_SET = "allowanceSet",
}

export type SetAllowanceStepValue =
  | { key: SetAllowanceSteps.SETTING_ALLOWANCE; txHash: string }
  | { key: SetAllowanceSteps.ALLOWANCE_SET; allowance: bigint };

/* Permissions */
type PermissionParamsBase = {
  where: string;
  who: string;
  permission: string;
};
type PermissionDecodedParamsBase = PermissionParamsBase & {
  permissionId: string;
};
export type GrantPermissionParams = PermissionParamsBase;
export type RevokePermissionParams = PermissionParamsBase;
export type GrantPermissionDecodedParams = PermissionDecodedParamsBase;
export type RevokePermissionDecodedParams = PermissionDecodedParamsBase;

export type GrantPermissionWithConditionParams = PermissionParamsBase & {
  condition: string;
};
export type GrantPermissionWithConditionDecodedParams = PermissionParamsBase & {
  condition: string;
  permissionId: string;
};

export type HasPermissionParams = PermissionParamsBase & {
  daoAddressOrEns: string;
  data?: Uint8Array;
};

export type RegisterStandardCallbackParams = {
  interfaceId: string;
  callbackSelector: string;
  magicNumber: string;
};

export type UpgradeToAndCallParams = {
  implementationAddress: string;
  data: Uint8Array;
};

export type InitializeFromParams = {
  previousVersion: [number, number, number];
  initData?: Uint8Array;
};
export type DecodedInitializeFromParams = {
  previousVersion: [number, number, number];
  initData: Uint8Array;
};

export type PluginUpdateProposalValidity = {
  isValid: boolean;
  causes: PluginUpdateProposalInValidityCause[];
};

export enum PluginUpdateProposalInValidityCause {
  INVALID_ACTIONS = "invalidActions",
  INVALID_GRANT_PERMISSION = "invalidGrantPermission",
  INVALID_REVOKE_PERMISSION = "invalidRevokePermission",
  PLUGIN_NOT_INSTALLED = "pluginNotInstalled",
  NOT_ARAGON_PLUGIN_REPO = "notAragonPluginRepo",
  MISSING_PLUGIN_REPO = "missingPluginRepo",
  MISSING_PLUGIN_PREPARATION = "missingPluginPreparation",
  INVALID_ALLOW_FAILURE_MAP = "invalidAllowFailureMap",
  INVALID_PLUGIN_RELEASE = "invalidPluginRelease",
  INVALID_PLUGIN_BUILD = "invalidPluginBuild",
  INVALID_DATA = "invalidData",
  INVALID_PLUGIN_REPO_METADATA = "invalidPluginRepoMetadata",
}

export type IsPluginUpdateProposalValidParams = {
  proposalId: string;
  version: VersionTag;
  pluginAddress: string;
  pluginPreparationIndex?: number;
};

export enum DaoUpdateProposalInvalidityCause {
  INVALID_ACTIONS = "invalidActions",
  INVALID_IMPLEMENTATION = "invalidImplementation",
  INVALID_VERSION = "invalidVersion",
  INVALID_INIT_DATA = "invalidInitData",
}

export type DaoUpdateProposalValidity = {
  isValid: boolean;
  causes: DaoUpdateProposalInvalidityCause[];
};

type IsUpdateParamsBase = {
  actions: DaoAction[];
  daoAddress: string;
};

export type IsDaoUpdateValidParams = IsUpdateParamsBase & {
  version?: [number, number, number];
};

export type DaoUpdateParams = InitializeFromParams & {
  daoFactoryAddress?: string;
};

export type DaoUpdateDecodedParams = InitializeFromParams & {
  implementationAddress: string;
};
export type IsPluginUpdateValidParams = IsUpdateParamsBase;
