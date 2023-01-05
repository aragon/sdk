import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import {
  AssetBalance,
  ContractFreezeParams,
  ContractPermissionParams,
  ContractWithdrawParams,
  DaoDetails,
  DaoListItem,
  IDepositParams,
  IFreezePermissionDecodedParams,
  IFreezePermissionParams,
  IGrantPermissionDecodedParams,
  IGrantPermissionParams,
  IMetadata,
  InstalledPluginListItem,
  IRevokePermissionDecodedParams,
  IRevokePermissionParams,
  IWithdrawParams,
  PermissionIds,
  SubgraphBalance,
  SubgraphDao,
  SubgraphDaoListItem,
  SubgraphPluginListItem,
  SubgraphPluginTypeMap,
  SubgraphTransferListItem,
  SubgraphTransferType,
  TokenType,
  Transfer,
  TransferType,
} from "../interfaces";
import { Result } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

export function unwrapDepositParams(
  params: IDepositParams,
): [string, BigNumber, string, string] {
  return [
    params.daoAddressOrEns,
    BigNumber.from(params.amount),
    params.tokenAddress ?? AddressZero,
    params.reference ?? "",
  ];
}

export function toDaoDetails(
  dao: SubgraphDao,
  metadata: IMetadata,
): DaoDetails {
  return {
    address: dao.id,
    ensDomain: dao.name,
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
      ): InstalledPluginListItem => {
        return {
          instanceAddress: plugin.plugin.id,
          // TODO
          // temporary ens addreses for the plugins
          id: SubgraphPluginTypeMap.get(
            plugin.plugin.__typename,
          ) as string,
          // TODO
          // update when subgraph returns version
          version: "0.0.1",
        };
      },
    ),
  };
}

export function toDaoListItem(
  dao: SubgraphDaoListItem,
  metadata: IMetadata,
): DaoListItem {
  return {
    address: dao.id,
    ensDomain: dao.name,
    metadata: {
      name: metadata.name,
      avatar: metadata.avatar || undefined,
    },
    // TODO update when new subgraph schema is deployed
    plugins: dao.plugins.map(
      (
        plugin: SubgraphPluginListItem,
      ): InstalledPluginListItem => {
        return {
          instanceAddress: plugin.plugin.id,
          // TODO
          // temporary ens addreses for the plugins
          id: SubgraphPluginTypeMap.get(
            plugin.plugin.__typename,
          ) as string,
          // TODO
          // update when subgraph returns version
          version: "0.0.1",
        };
      },
    ),
  };
}

export function toAssetBalance(balance: SubgraphBalance): AssetBalance {
  const updateDate = new Date(parseInt(balance.lastUpdated) * 1000);
  if (balance.token.symbol === "ETH") {
    return {
      type: "native",
      balance: BigInt(balance.balance),
      updateDate,
    };
  }
  return {
    type: "erc20",
    address: balance.token.id,
    name: balance.token.name,
    symbol: balance.token.symbol,
    decimals: parseInt(balance.token.decimals),
    balance: BigInt(balance.balance),
    updateDate,
  };
}

export function toTransfer(transfer: SubgraphTransferListItem): Transfer {
  const creationDate = new Date(parseInt(transfer.createdAt) * 1000);
  if (transfer.token.symbol === "ETH") {
    if (transfer.type === SubgraphTransferType.DEPOSIT) {
      return {
        type: TransferType.DEPOSIT,
        tokenType: TokenType.NATIVE,
        amount: BigInt(transfer.amount),
        creationDate,
        reference: transfer.reference,
        transactionId: transfer.transaction,
        from: transfer.sender,
      };
    }
    return {
      type: TransferType.WITHDRAW,
      tokenType: TokenType.NATIVE,
      amount: BigInt(transfer.amount),
      creationDate,
      reference: transfer.reference,
      transactionId: transfer.transaction,
      proposalId: transfer.proposal?.id || "",
      to: transfer.to,
    };
  }
  if (transfer.type === SubgraphTransferType.DEPOSIT) {
    return {
      type: TransferType.DEPOSIT,
      tokenType: TokenType.ERC20,
      token: {
        address: transfer.token.id,
        name: transfer.token.name,
        symbol: transfer.token.symbol,
        decimals: parseInt(transfer.token.decimals),
      },
      amount: BigInt(transfer.amount),
      creationDate,
      reference: transfer.reference,
      transactionId: transfer.transaction,
      from: transfer.sender,
    };
  }
  return {
    type: TransferType.WITHDRAW,
    tokenType: TokenType.ERC20,
    token: {
      address: transfer.token.id,
      name: transfer.token.name,
      symbol: transfer.token.symbol,
      decimals: parseInt(transfer.token.decimals),
    },
    amount: BigInt(transfer.amount),
    creationDate,
    reference: transfer.reference,
    transactionId: transfer.transaction,
    to: transfer.to,
    proposalId: transfer.proposal.id || "",
  };
}

export function freezeParamsToContract(
  params: IFreezePermissionParams,
): ContractFreezeParams {
  return [params.where, keccak256(toUtf8Bytes(params.permission))];
}
export function freezeParamsFromContract(
  result: Result,
): IFreezePermissionDecodedParams {
  return {
    where: result[0],
    permissionId: result[1],
    permission: Object.keys(PermissionIds)
      .find((k) => PermissionIds[k] === result[1])
      ?.replace(/_ID$/, "") || "",
  };
}

export function permissionParamsToContract(
  params: IGrantPermissionParams | IRevokePermissionParams,
): ContractPermissionParams {
  return [params.where, params.who, keccak256(toUtf8Bytes(params.permission))];
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

export function withdrawParamsFromContract(result: Result): IWithdrawParams {
  return {
    tokenAddress: result[0],
    recipientAddress: result[1],
    amount: BigInt(result[2]),
    reference: result[3],
  };
}

export function withdrawParamsToContract(
  params: IWithdrawParams,
): ContractWithdrawParams {
  return [
    params.tokenAddress ?? AddressZero,
    params.recipientAddress,
    BigNumber.from(params.amount),
    params.reference ?? "",
  ];
}
