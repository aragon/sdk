import { DAOFactory } from "@aragon/core-contracts-ethers";
import { strip0x } from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { pack } from "@ethersproject/solidity";
import {
  AssetBalance,
  DaoDetails,
  DaoListItem,
  ICreateParams,
  IDepositParams,
  IMetadata,
  InstalledPluginListItem,
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
} from "../interfaces/client";

export function unwrapCreateDaoParams(
  params: ICreateParams,
  metadataCid: string,
): [DAOFactory.DAOConfigStruct, DAOFactory.VoteConfigStruct, string, string] {
  // TODO: Serialize plugin params into a buffer
  const pluginDataBytes = "0x" +
    params.plugins
      .map((entry) => {
        const item = pack(["uint256", "bytes[]"], [entry.id, entry.data]);
        return strip0x(item);
      })
      .join("");

  return [
    {
      name: params.ensSubdomain,
      metadata: "ipfs://" + metadataCid,
    },
    {
      // TODO: Adapt the DAO creation parameters
      participationRequiredPct: BigInt(10), // BigInt(params.votingConfig.minParticipation),
      supportRequiredPct: BigInt(50), // BigInt(params.votingConfig.minSupport),
      minDuration: BigInt(50), // BigInt(params.votingConfig.minDuration),
    },
    // {
    //   addr: params.tokenConfig.address,
    //   name: params.tokenConfig.name,
    //   symbol: params.tokenConfig.symbol,
    // },
    // {
    //   receivers: params.mintConfig.map((receiver) => receiver.address),
    //   amounts: params.mintConfig.map((receiver) => receiver.balance),
    // },
    pluginDataBytes,
    AddressZero, // TODO: Remove when the new contract version is available
  ];
}

export function  unwrapDepositParams(
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
    plugins: dao.packages.map(
      (
        plugin: SubgraphPluginListItem,
      ): InstalledPluginListItem => {
        return {
          instanceAddress: plugin.pkg.id,
          // TODO
          // temporary ens addreses for the plugins
          id: SubgraphPluginTypeMap.get(
            plugin.pkg.__typename,
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
    plugins: dao.packages.map(
      (
        plugin: SubgraphPluginListItem,
      ): InstalledPluginListItem => {
        return {
          instanceAddress: plugin.pkg.id,
          // TODO
          // temporary ens addreses for the plugins
          id: SubgraphPluginTypeMap.get(
            plugin.pkg.__typename,
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
      proposalId: transfer.proposal.id || "",
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
