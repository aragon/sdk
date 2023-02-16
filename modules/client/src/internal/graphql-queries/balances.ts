import { gql } from "graphql-request";

export const QueryAssetBalances = gql`
query AssetBalances($where: AssetBalance_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: AssetBalance_orderBy!) {
  AssetBalances (where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy) {
    lastUpdated
    __typename
    ... on ERC20Balance {
      balance
      token {
        name
        decimals
        symbol
        id
      }
    }
    ... on ERC721Balance {
      token {
        name
        symbol
        id
      }
    }
    ... on NativeBalance {
      balance
    }
  }
}
`;
