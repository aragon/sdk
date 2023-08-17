import { gql } from "graphql-request";

export const QueryTokenBalances = gql`
query TokenBalances($where: TokenBalance_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: TokenBalance_orderBy!) {
  tokenBalances (where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy) {
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
      tokenIds
    }
    ... on NativeBalance {
      balance
    }
    ... on ERC1155Balance {
      metadataUri
      token {
        id
      }
      balances {
        amount
        id
        tokenId
      }
    }
  }
}
`;
