import { gql } from 'graphql-request';

/**
 * TODO: This will be imported from @aragon/core-subgraph
 */
export const DAO_LIST = gql`
  query DAOs($offset: Int, $limit: Int) {
    daos(
      skip: $offset
      first: $limit
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      name
      creator
      metadata
      token {
        id
        name
        symbol
        decimals
      }
      deposits {
        id
      }
      withdraws {
        id
      }
      balances {
        id
      }
      roles {
        id
      }
      permissions {
        id
      }
      packages {
        pkg {
          id
        }
      }
      proposals {
        id
        executed
      }
    }
  }
`;
