import { gql } from "graphql-request";

export const QueryTokenBalances = gql`
query TokenBalances($address: ID!, $limit: Int = 10, $skip: Int = 0) {
  tokenBalances {
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
