import {
  AssetBalance,
  ContractPermissionParams,
  ContractPermissionWithConditionParams,
  DaoDetails,
  DaoListItem,
  DaoMetadata,
  DepositErc20Params,
  DepositEthParams,
  GrantPermissionWithConditionDecodedParams,
  GrantPermissionWithConditionParams,
  IGrantPermissionDecodedParams,
  IGrantPermissionParams,
  InstalledPluginListItem,
  IRevokePermissionDecodedParams,
  IRevokePermissionParams,
  PermissionIds,
  PluginRepo,
  PluginRepoBuildMetadata,
  PluginRepoListItem,
  PluginRepoRelease,
  PluginRepoReleaseMetadata,
  SubgraphBalance,
  SubgraphDao,
  SubgraphDaoListItem,
  SubgraphPluginListItem,
  SubgraphPluginRepoListItem,
  SubgraphPluginRepoReleaseListItem,
  SubgraphPluginVersion,
  SubgraphTransferListItem,
  SubgraphTransferType,
  TokenType,
  Transfer,
  TransferType,
  WithdrawParams,
} from "../interfaces";
import { defaultAbiCoder, Result } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { AddressZero } from "@ethersproject/constants";
import { PluginSetupProcessor } from "@aragon/osx-ethers";
import {
  ApplyInstallationParams,
  DecodedApplyInstallationParams,
} from "../client-common";
import { hexToBytes } from "@aragon/sdk-common";

export function unwrapDepositParams(
  params: DepositEthParams | DepositErc20Params,
): [string, bigint, string, string] {
  return [
    params.daoAddressOrEns,
    params.amount,
    (params as any)?.tokenAddress ?? AddressZero,
    "",
  ];
}

export function toDaoDetails(
  dao: SubgraphDao,
  metadata: DaoMetadata,
): DaoDetails {
  return {
    address: dao.id,
    ensDomain: dao.subdomain + ".dao.eth",
    metadata: {
      name: metadata.name,
      description: metadata.description,
      avatar: metadata.avatar || undefined,
      links: metadata.links,
    },
    creationDate: new Date(parseInt(dao.createdAt) * 1000),
    // TODO update when new subgraph schema is deployed
    plugins: dao.plugins.map(
      (
        plugin: SubgraphPluginListItem,
      ): InstalledPluginListItem[] => {
        return plugin.installations.map((installation) => {
          return {
            instanceAddress: plugin.id,
            id:
              `${installation.appliedVersion.pluginRepo.subdomain}.plugin.dao.eth`,
            release: installation.appliedVersion.release.release,
            build: installation.appliedVersion.build,
          };
        });
      },
    ).flat(),
  };
}

export function toDaoListItem(
  dao: SubgraphDaoListItem,
  metadata: DaoMetadata,
): DaoListItem {
  return {
    address: dao.id,
    ensDomain: dao.subdomain + ".dao.eth",
    metadata: {
      name: metadata.name,
      description: metadata.description,
      avatar: metadata.avatar || undefined,
    },
    plugins: dao.plugins.map(
      (
        plugin: SubgraphPluginListItem,
      ): InstalledPluginListItem[] => {
        return plugin.installations.map((installation) => {
          return {
            instanceAddress: plugin.id,
            id:
              `${installation.appliedVersion.pluginRepo.subdomain}.plugin.dao.eth`,
            release: installation.appliedVersion.release.release,
            build: installation.appliedVersion.build,
          };
        });
      },
    ).flat(),
  };
}

export function toAssetBalance(balance: SubgraphBalance): AssetBalance {
  const updateDate = new Date(parseInt(balance.lastUpdated) * 1000);
  if (balance.__typename === "NativeBalance") {
    return {
      type: TokenType.NATIVE,
      balance: BigInt(balance.balance),
      updateDate,
    };
  } else if (balance.__typename === "ERC721Balance") {
    return {
      type: TokenType.ERC721,
      name: balance.token.name,
      symbol: balance.token.symbol,
      updateDate,
      address: balance.token.id,
    };
  } else {
    return {
      type: TokenType.ERC20,
      address: balance.token.id,
      name: balance.token.name,
      symbol: balance.token.symbol,
      decimals: balance.token.decimals,
      balance: BigInt(balance.balance),
      updateDate,
    };
  }
}

export function toTokenTransfer(transfer: SubgraphTransferListItem): Transfer {
  const creationDate = new Date(parseInt(transfer.createdAt) * 1000);
  if (transfer.__typename === "NativeTransfer") {
    if (transfer.type === SubgraphTransferType.DEPOSIT) {
      return {
        type: TransferType.DEPOSIT,
        tokenType: TokenType.NATIVE,
        amount: BigInt(transfer.amount),
        creationDate,
        transactionId: transfer.txHash,
        from: transfer.from,
        to: transfer.to,
      };
    }
    return {
      type: TransferType.WITHDRAW,
      tokenType: TokenType.NATIVE,
      amount: BigInt(transfer.amount),
      creationDate,
      transactionId: transfer.txHash,
      proposalId: transfer.proposal?.id || "",
      to: transfer.to,
      from: transfer.from,
    };
  } else if (transfer.__typename === "ERC721Transfer") {
    if (transfer.type === SubgraphTransferType.DEPOSIT) {
      return {
        type: TransferType.DEPOSIT,
        tokenType: TokenType.ERC721,
        token: {
          address: transfer.token.id,
          name: transfer.token.name,
          symbol: transfer.token.symbol,
        },
        creationDate,
        transactionId: transfer.txHash,
        from: transfer.from,
        to: transfer.to,
      };
    }
    return {
      type: TransferType.WITHDRAW,
      tokenType: TokenType.ERC721,
      token: {
        address: transfer.token.id,
        name: transfer.token.name,
        symbol: transfer.token.symbol,
      },
      creationDate,
      transactionId: transfer.txHash,
      to: transfer.to,
      from: transfer.from,
      proposalId: transfer.proposal?.id || "",
    };
  } else {
    if (transfer.type === SubgraphTransferType.DEPOSIT) {
      return {
        type: TransferType.DEPOSIT,
        tokenType: TokenType.ERC20,
        token: {
          address: transfer.token.id,
          name: transfer.token.name,
          symbol: transfer.token.symbol,
          decimals: transfer.token.decimals,
        },
        amount: BigInt(transfer.amount),
        creationDate,
        transactionId: transfer.txHash,
        from: transfer.from,
        to: transfer.to,
      };
    }
    return {
      type: TransferType.WITHDRAW,
      tokenType: TokenType.ERC20,
      token: {
        address: transfer.token.id,
        name: transfer.token.name,
        symbol: transfer.token.symbol,
        decimals: transfer.token.decimals,
      },
      amount: BigInt(transfer.amount),
      creationDate,
      transactionId: transfer.txHash,
      to: transfer.to,
      from: transfer.from,
      proposalId: transfer.proposal?.id || "",
    };
  }
}

export function toPluginRepoRelease(
  release: SubgraphPluginRepoReleaseListItem,
  metadata: PluginRepoReleaseMetadata,
): PluginRepoRelease {
  return {
    release: release.release,
    latestBuild: Math.max(...release.builds.map((build) => build.build)),
    metadata,
  };
}

export function toPluginRepoListItem(
  pluginRepo: SubgraphPluginRepoListItem,
  releases: PluginRepoRelease[],
): PluginRepoListItem {
  return {
    address: pluginRepo.id,
    subdomain: pluginRepo.subdomain,
    releases,
  };
}
export function toPluginRepo(
  pluginVersion: SubgraphPluginVersion,
  releaseMetadata: PluginRepoReleaseMetadata,
  buildMetadata: PluginRepoBuildMetadata,
): PluginRepo {
  return {
    address: pluginVersion.pluginRepo.id,
    subdomain: pluginVersion.pluginRepo.subdomain,
    buildDetails: {
      build: pluginVersion.build,
      metadata: buildMetadata,
    },
    releaseDetails: {
      release: pluginVersion.release.release,
      metadata: releaseMetadata,
    },
  };
}

export function applyInstallatonParamsToContract(
  params: ApplyInstallationParams,
): PluginSetupProcessor.ApplyInstallationParamsStruct {
  return {
    plugin: params.pluginAddress,
    pluginSetupRef: {
      pluginSetupRepo: params.pluginRepo,
      versionTag: params.versionTag,
    },
    helpersHash: keccak256(
      defaultAbiCoder.encode(["address[]"], [params.helpers]),
    ),
    permissions: params.permissions,
  };
}
export function applyInstallatonParamsFromContract(
  result: Result,
): DecodedApplyInstallationParams {
  const params = result[1];
  return {
    helpersHash: params.helpersHash,
    permissions: params.permissions.map((permission: any) => {
      return {
        ...permission,
        permissionId: hexToBytes(permission.permissionId),
      };
    }),
    versionTag: params.pluginSetupRef.versionTag,
    pluginAddress: params.plugin,
    pluginRepo: params.pluginSetupRef.pluginSetupRepo,
  };
}

export function permissionParamsToContract(
  params: IGrantPermissionParams | IRevokePermissionParams,
): ContractPermissionParams {
  return [params.where, params.who, keccak256(toUtf8Bytes(params.permission))];
}
export function permissionWithConditionParamsToContract(
  params: GrantPermissionWithConditionParams,
): ContractPermissionWithConditionParams {
  return [
    ...permissionParamsToContract({
      who: params.who,
      where: params.where,
      permission: params.permission,
    }),
    params.condition,
  ];
}

export function permissionParamsFromContract(
  result: Result,
): IGrantPermissionDecodedParams | IRevokePermissionDecodedParams {
  return {
    where: result[0],
    who: result[1],
    permissionId: result[2],
    permission: Object.keys(PermissionIds)
      .find((k) => PermissionIds[k] === result[2])
      ?.replace(/_ID$/, "") || "",
  };
}
export function permissionParamsWitConditionFromContract(
  result: Result,
): GrantPermissionWithConditionDecodedParams {
  return {
    ...permissionParamsFromContract(result),
    condition: result[3],
  };
}

export function withdrawParamsFromContract(
  to: string,
  _value: bigint,
  result: Result,
  tokenStandard: TokenType,
): WithdrawParams {
  if (tokenStandard === TokenType.ERC20) {
    return {
      type: TokenType.ERC20,
      tokenAddress: to,
      recipientAddressOrEns: result[0],
      amount: BigInt(result[1]),
    };
  }
  // TODO Add ERC721 and ERC1155
  throw new Error("not implemented");
}

