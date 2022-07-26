import { gql } from "graphql-request";

export const getDaoByAddress = gql`
  query getDaoByAddress($address: ID!) {
    dao(id: $address){
      id
      name
      metadata
      createdAt
    }
  }
`

export const getDaoTransfersByAddress = gql`
query getDaotransfersByAddress($address: ID!) {
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