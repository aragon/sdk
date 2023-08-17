import { gql } from "graphql-request";

export const QueryTokenTransfers = gql`
  query TokenTransfers(
    $where: TokenTransfer_filter!
    $limit: Int!
    $skip: Int!
    $direction: OrderDirection!
    $sortBy: TokenTransfer_orderBy!
  ) {
    tokenTransfers(
      where: $where
      first: $limit
      skip: $skip
      orderDirection: $direction
      orderBy: $sortBy
    ) {
      from
      to
      type
      createdAt
      txHash
      proposal {
        id
      }
      __typename
      ... on ERC20Transfer {
        amount
        token {
          id
          name
          symbol
          decimals
        }
      }
      ... on ERC721Transfer {
        token {
          id
          name
          symbol
        }
      }
      ... on NativeTransfer {
        amount
      }
    }
  }
`;
