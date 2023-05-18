import { BigNumber } from "@ethersproject/bignumber";
import { TransferType } from "../types";

export type SubgraphPluginListItem = {
  appliedPreparation: {
    pluginAddress: string;
  };
  appliedPluginRepo: {
    subdomain: string;
  };
  appliedVersion: {
    build: number;
    release: {
      release: number;
    };
  };
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
