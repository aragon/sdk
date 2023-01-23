import { gql } from "graphql-request";

export const QueryDaoBalances = gql`
query DaoBalances($address: ID!, $limit: Int = 10, $skip: Int = 0) {
    balances(where:{dao:$address}) {
      token {
        id
        name
        symbol
        decimals
      }
      balance
      lastUpdated
    }
  }
`;
