import { gql } from "graphql-request";

export const searchDeposit = gql`
query searchDeposit($address: ID!, $pageSize: Int = 10, $offset: Int = 0) {
  vaultDeposits(where: {to: $address}, limit: $pageSize, skip: $offset){
    id
    token {
      symbol
      decimals
      symbol
    }
    sender
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