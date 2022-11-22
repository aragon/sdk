import { gql } from "graphql-request";

export const QueryDao = gql`
  query dao($address: ID!) {
    dao(id: $address){
      id
      name
      metadata
      createdAt
      plugins{
        plugin{
        id
          __typename
        }
      }
    }
  }
`;
export const QueryDaos = gql`
  query daos ($limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: Dao_orderBy!) {
    daos(first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
      id
      name
      metadata
      plugins{
        plugin{
        id
          __typename
        }
      }
    }
  }
`;

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
`;
