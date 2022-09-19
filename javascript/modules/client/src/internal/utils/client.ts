import {
  AssetBalance,
  DaoDetails,
  DaoListItem,
  DaoMetadata,
  InstalledPluginListItem,
  ISubgraphBalance,
  ISubgraphDao,
  ISubgraphDaoListItem,
  SubgraphPluginListItem,
  SubgraphPluginTypeMap,
} from "../interfaces/client";

export function toDaoDetails(
  dao: ISubgraphDao,
  metadata: DaoMetadata,
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
  dao: ISubgraphDaoListItem,
  metadata: DaoMetadata,
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

export function toAssetBalance(balance: ISubgraphBalance): AssetBalance {
  const updateDate = new Date(parseInt(balance.lastUpdated) * 1000) 
  if (balance.token.symbol === "ETH") {
    return {
      type: "native",
      balance: BigInt(balance.balance),
      updateDate
    };
  }
  return {
    type: "erc20",
    address: balance.token.id,
    name: balance.token.name,
    symbol: balance.token.symbol,
    decimals: parseInt(balance.token.decimals),
    balance: BigInt(balance.balance),
    updateDate
  };
}
