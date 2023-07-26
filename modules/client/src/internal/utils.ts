import {
  ApplyUninstallationParams,
  AssetBalance,
  DaoDepositSteps,
  DaoDepositStepValue,
  DaoDetails,
  DaoListItem,
  DaoMetadata,
  DepositErc20Params,
  DepositErc721Params,
  DepositEthParams,
  GrantPermissionDecodedParams,
  GrantPermissionParams,
  GrantPermissionWithConditionDecodedParams,
  GrantPermissionWithConditionParams,
  InstalledPluginListItem,
  PluginRepo,
  PluginRepoBuildMetadata,
  PluginRepoListItem,
  PluginRepoRelease,
  PluginRepoReleaseMetadata,
  RevokePermissionDecodedParams,
  RevokePermissionParams,
  Transfer,
  TransferType,
  WithdrawParams,
} from "../types";
import {
  ContractPermissionParams,
  ContractPermissionWithConditionParams,
  SubgraphBalance,
  SubgraphDao,
  SubgraphDaoListItem,
  SubgraphPluginListItem,
  SubgraphPluginRepo,
  SubgraphPluginRepoListItem,
  SubgraphPluginRepoReleaseListItem,
  SubgraphTransferListItem,
  SubgraphTransferType,
} from "./types";
import { defaultAbiCoder, Result } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { AddressZero } from "@ethersproject/constants";
import { DAO__factory, PluginSetupProcessor } from "@aragon/osx-ethers";
import { PermissionIds } from "../constants";
import {
  ApplyInstallationParams,
  DecodedApplyInstallationParams,
  findLog,
  TokenType,
} from "@aragon/sdk-client-common";
import {
  AmountMismatchError,
  FailedDepositError,
  NotImplementedError,
} from "@aragon/sdk-common";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";
import { abi as ERC721_ABI } from "@openzeppelin/contracts/build/contracts/ERC721.json";
import { abi as ERC20_ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { BigNumber } from "@ethersproject/bignumber";

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
    // filter out plugins that are not applied
    plugins: dao.plugins.filter(
      (plugin) =>
        plugin.appliedPreparation && plugin.appliedVersion &&
        plugin.appliedPluginRepo,
    )
      .map(
        (
          plugin: SubgraphPluginListItem,
        ): InstalledPluginListItem => (
          {
            // we checked with the filter above that these are not null
            id: `${plugin.appliedPluginRepo!.subdomain}.plugin.dao.eth`,
            release: plugin.appliedVersion!.release.release,
            build: plugin.appliedVersion!.build,
            instanceAddress: plugin.appliedPreparation!.pluginAddress,
          }
        ),
      ),
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
    plugins: dao.plugins.filter(
      (plugin) =>
        plugin.appliedPreparation && plugin.appliedVersion &&
        plugin.appliedPluginRepo,
    )
      .map(
        (
          plugin: SubgraphPluginListItem,
        ): InstalledPluginListItem => (
          {
            // we checked with the filter above that these are not null
            id: `${plugin.appliedPluginRepo!.subdomain}.plugin.dao.eth`,
            release: plugin.appliedVersion!.release.release,
            build: plugin.appliedVersion!.build,
            instanceAddress: plugin.appliedPreparation!.pluginAddress,
          }
        ),
      ),
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
    currentBuild: Math.max(...release.builds.map((build) => build.build)),
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
  pluginRepo: SubgraphPluginRepo,
  releaseMetadata: PluginRepoReleaseMetadata,
  buildMetadata: PluginRepoBuildMetadata,
): PluginRepo {
  return {
    address: pluginRepo.id,
    subdomain: pluginRepo.subdomain,
    current: {
      build: {
        metadata: buildMetadata,
        // the subgraph returns only one build ordered by build number
        // in descending order, this means it's the latest build
        number: pluginRepo.releases?.[0]?.builds?.[0]?.build,
      },
      release: {
        metadata: releaseMetadata,
        // the subgraph returns only one realease ordered by realease number
        // in descending order, this means it's the latest realease
        number: pluginRepo.releases?.[0]?.release,
      },
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
    permissions: params.permissions.map((permission) => {
      return { ...permission, condition: permission.condition || AddressZero };
    }),
  };
}
export function applyUninstallationParamsToContract(
  params: ApplyUninstallationParams,
): PluginSetupProcessor.ApplyUninstallationParamsStruct {
  return {
    plugin: params.pluginAddress,
    pluginSetupRef: {
      pluginSetupRepo: params.pluginRepo,
      versionTag: params.versionTag,
    },
    permissions: params.permissions.map((permission) => {
      return { ...permission, condition: permission.condition || AddressZero };
    }),
  };
}
export function applyInstallatonParamsFromContract(
  result: Result,
): DecodedApplyInstallationParams {
  const params = result[1];
  return {
    helpersHash: params.helpersHash,
    permissions: params.permissions,
    versionTag: params.pluginSetupRef.versionTag,
    pluginAddress: params.plugin,
    pluginRepo: params.pluginSetupRef.pluginSetupRepo,
  };
}

export function permissionParamsToContract(
  params: GrantPermissionParams | RevokePermissionParams,
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
): GrantPermissionDecodedParams | RevokePermissionDecodedParams {
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
  switch (tokenStandard) {
    case TokenType.ERC20:
      return {
        type: TokenType.ERC20,
        tokenAddress: to,
        recipientAddressOrEns: result[0],
        amount: BigInt(result[1]),
      };
    case TokenType.ERC721:
      return {
        type: TokenType.ERC721,
        tokenAddress: to,
        recipientAddressOrEns: result[1],
        tokenId: BigInt(result[2]),
        daoAddressOrEns: result[0],
      };
  }

  // TODO Add ERC1155
  throw new NotImplementedError("Token standard not supported");
}

export async function* depositErc721(
  signer: Signer,
  params: DepositErc721Params,
): AsyncGenerator<DaoDepositStepValue> {
  const erc721Contract = new Contract(params.tokenAddress, ERC721_ABI, signer);
  const tx = await erc721Contract["safeTransferFrom(address,address,uint256)"](
    await signer.getAddress(),
    params.daoAddressOrEns,
    params.tokenId,
  );

  const cr = await tx.wait();

  const log = findLog(cr, erc721Contract.interface, "Transfer");

  if (!log) {
    throw new FailedDepositError();
  }

  const parsedLog = erc721Contract.interface.parseLog(log);
  if (
    !parsedLog.args["tokenId"] ||
    parsedLog.args["tokenId"].toString() !== params.tokenId.toString()
  ) {
    throw new FailedDepositError();
  }
  yield {
    key: DaoDepositSteps.DONE,
    tokenId: params.tokenId,
  };
}

export async function* depositErc20(
  signer: Signer,
  params: DepositErc20Params | DepositEthParams,
): AsyncGenerator<DaoDepositStepValue> {
  let tokenAddress = AddressZero;
  if (params.type === TokenType.ERC20) {
    tokenAddress = params.tokenAddress;
  }
  const {
    amount,
    daoAddressOrEns,
  } = params;
  // Doing the transfer
  const daoInstance = DAO__factory.connect(daoAddressOrEns, signer);
  const override: { value?: bigint } = {};

  if (tokenAddress === AddressZero) {
    // Ether
    override.value = params.amount;
  }

  const tx = await daoInstance.deposit(
    tokenAddress,
    amount,
    "",
    override,
  );
  yield { key: DaoDepositSteps.DEPOSITING, txHash: tx.hash };

  const cr = await tx.wait();
  const log = findLog(cr, daoInstance.interface, "Deposited");
  if (!log) {
    throw new FailedDepositError();
  }

  const daoInterface = DAO__factory.createInterface();
  const parsedLog = daoInterface.parseLog(log);

  if (!amount.toString() === parsedLog.args["amount"]) {
    throw new AmountMismatchError(
      amount,
      parsedLog.args["amount"].toBigInt(),
    );
  }
  yield { key: DaoDepositSteps.DONE, amount: amount };
}

export async function getCurrentAllowance(
  signer: Signer,
  params: {
    tokenAddress: string;
    daoAddressOrEns: string;
  },
): Promise<BigNumber> {
  const { tokenAddress, daoAddressOrEns } = params;
  // check current allowance
  const tokenContract = new Contract(
    tokenAddress,
    ERC20_ABI,
    signer,
  );
  const currentAllowance = await tokenContract.allowance(
    await signer.getAddress(),
    daoAddressOrEns,
  );
  return currentAllowance;
}
