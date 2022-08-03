import { gql } from "graphql-request";

export const QueryWhithdrawals = gql`
query withdrawals($address: ID!, $limit: Int = 10, $skip: Int = 0) {
  vaultWithdraws(where: {to: $address}, limit: $limit, skip: $skip){
    id
    token {
      symbol
      decimals
      symbol
    }
    to
    dao {
      id
      name
    }
    amount
    reference
    transaction
    createdAt
  }
}

`