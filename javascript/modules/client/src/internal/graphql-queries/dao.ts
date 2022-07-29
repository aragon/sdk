import { gql } from "graphql-request";

export const QueryGetDaoByAddres = gql`
  query getDaoByAddress($address: ID!) {
    dao(id: $address){
      id
      name
      metadata
      createdAt
    }
  }
`

export const QueryGetDaoTransfersByAddress = gql`
query getDaoTransfersByAddress($address: ID!) {
  dao(id: $address) {
    withdraws {
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
    deposits {
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
}
`