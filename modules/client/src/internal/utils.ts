import {
  ContractPermissionParams,
  DaoDetails,
  DaoListItem,
  DaoMetadata,
  DepositErc20Params,
  DepositEthParams,
  IGrantPermissionDecodedParams,
  IGrantPermissionParams,
  InstalledPluginListItem,
  IRevokePermissionDecodedParams,
  IRevokePermissionParams,
  PermissionIds,
  SubgraphBalance,
  SubgraphDao,
  SubgraphDaoListItem,
  SubgraphPluginListItem,
  SubgraphPluginTypeMap,
  SubgraphTransferListItem,
  SubgraphTransferType,
  TokenBalance,
  TokenType,
  Transfer,
  TransferType,
  WithdrawParams,
} from "../interfaces";
import { Result } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { AddressZero } from "@ethersproject/constants";

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
    ensDomain: dao.subdomain,
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
          instanceAddress: plugin.id,
          // TODO
          // temporary ens addreses for the plugins
          id: SubgraphPluginTypeMap.get(
            plugin.__typename,
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
  metadata: DaoMetadata,
): DaoListItem {
  return {
    address: dao.id,
    ensDomain: dao.subdomain,
    metadata: {
      name: metadata.name,
      description: metadata.description,
      avatar: metadata.avatar || undefined,
    },
    // TODO update when new subgraph schema is deployed
    plugins: dao.plugins.map(
      (
        plugin: SubgraphPluginListItem,
      ): InstalledPluginListItem => {
        return {
          instanceAddress: plugin.id,
          // TODO
          // temporary ens addreses for the plugins
          id: SubgraphPluginTypeMap.get(
            plugin.__typename,
          ) as string,
          // TODO
          // update when subgraph returns version
          version: "0.0.1",
        };
      },
    ),
  };
}

export function toTokenBalance(balance: SubgraphBalance): TokenBalance {
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
      name: balance.token.symbol,
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
        transactionId: transfer.txhash,
        from: transfer.from,
        to: transfer.to,
        reference: transfer.reference,
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
      reference: transfer.reference,
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
      proposalId: transfer.proposal.id || "",
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
      proposalId: transfer.proposal.id || "",
    };
  }
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
