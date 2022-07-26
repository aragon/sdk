import { gql } from "graphql-request";

export const searchWithdraw = gql`
query searchWithdraw($address: ID!, $pageSize: Int = 10, $offset: Int = 0) {
  vaultWithdraws(where: {to: $address}, limit: $pageSize, skip: $offset){
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