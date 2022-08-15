import { gql } from "graphql-request";

export const QueryDaoByAddress = gql`
  query daoByAddress($address: ID!) {
    dao(id: $address){
      id
      name
      metadata
      creationDate
    }
  }
`

export const QueryDaoTransfersByAddress = gql`
query daoTransfersByAddress($address: ID!) {
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
      creationDate
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
      creationDate
    }
  }
}
`