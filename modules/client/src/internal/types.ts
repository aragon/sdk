import { BigNumber } from "@ethersproject/bignumber";
import { TransferType } from "../types";
import { SubgraphAction } from "../client-common";

export type SubgraphPluginListItem = {
  appliedPreparation: {
    pluginAddress: string;
  } | null;
  appliedPluginRepo: {
    subdomain: string;
  } | null;
  appliedVersion: {
    build: number;
    release: {
      release: number;
    };
  } | null;
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

type SubgraphBalanceBase = {
  id: string;
  lastUpdated: string;
  __typename: string;
};

export type SubgraphErc20Balance = SubgraphBalanceBase & {
  __typename: "ERC20Balance";
  balance: string;
  token: SubgraphErc20Token;
};

export type SubgraphErc721Balance = SubgraphBalanceBase & {
  __typename: "ERC721Balance";
  token: SubgraphErc721Token;
  tokenIds: string[];
};

export type SubgraphNativeBalance = SubgraphBalanceBase & {
  __typename: "NativeBalance";
  balance: string;
};

export type SubgraphErc1155Balance = SubgraphBalanceBase & {
  __typename: "ERC1155Balance";
  metadataUri: string;
  token: SubgraphErc1155Token;
  balances: {
    amount: string;
    id: string;
    tokenId: string;
  }[];
};

export type SubgraphBalance =
  | SubgraphErc20Balance
  | SubgraphErc721Balance
  | SubgraphNativeBalance
  | SubgraphErc1155Balance;

export enum SubgraphTransferType {
  DEPOSIT = "Deposit",
  WITHDRAW = "Withdraw",
}

type SubgraphTransferListItemBase = {
  from: string;
  to: string;
  type: SubgraphTransferType;
  createdAt: string;
  txHash: string;
  proposal: {
    id: string | null;
  };
};

export type SubgraphErc20TransferListItem = SubgraphTransferListItemBase & {
  __typename: "ERC20Transfer";
  amount: string;
  token: SubgraphErc20Token;
};

export type SubgraphErc721TransferListItem = SubgraphTransferListItemBase & {
  __typename: "ERC721Transfer";
  token: SubgraphErc721Token;
};

export type SubgraphNativeTransferListItem = SubgraphTransferListItemBase & {
  __typename: "NativeTransfer";
  amount: string;
};

export type SubgraphErc1155TransferListItem = SubgraphTransferListItemBase & {
  __typename: "ERC1155Transfer";
  amount: string;
  tokenId: string;
  token: SubgraphErc1155Token;
};

export type SubgraphTransferListItem =
  | SubgraphErc20TransferListItem
  | SubgraphErc721TransferListItem
  | SubgraphNativeTransferListItem
  | SubgraphErc1155TransferListItem;

type SubgraphTokenBase = {
  id: string;
};

export type SubgraphErc20Token = SubgraphTokenBase & {
  name: string;
  symbol: string;
  decimals: number;
};

export type SubgraphErc721Token = SubgraphTokenBase & {
  name: string;
  symbol: string;
};

export type SubgraphErc1155Token = SubgraphTokenBase;

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

export type SubgraphPluginRepoReleaseListItem = {
  release: number;
  metadata: string;
  builds: {
    build: number;
  }[];
};

export type SubgraphPluginRepoRelease = SubgraphPluginRepoReleaseListItem & {
  builds: {
    build: number;
    metadata: string;
  }[];
};

export type SubgraphPluginRepoListItem = {
  id: string;
  subdomain: string;
  releases: SubgraphPluginRepoReleaseListItem[];
};

export type SubgraphPluginRepo = SubgraphPluginRepoListItem & {
  releases: SubgraphPluginRepoRelease[];
};

export type SubgraphPluginVersion = {
  release: {
    release: number;
  };
  metadata: string;
  build: number;
};

export type SubgraphPluginPreparation = {
  helpers: string[];
  pluginRepo: {
    id: string;
  };
};

export type SubgraphPluginInstallation = {
  appliedVersion: SubgraphPluginVersion;
  appliedPreparation: SubgraphPluginPreparation;
};

export type SubgraphIProposal = {
  dao: {
    id: string;
  };
  allowFailureMap: string;
  actions: SubgraphAction[];
};

export type SubgraphPluginUpdatePreparation = {
  data: string;
};

export enum SubgraphPluginPreparationType {
  INSTALLATION = "Installation",
  UPDATE = "Update",
}
