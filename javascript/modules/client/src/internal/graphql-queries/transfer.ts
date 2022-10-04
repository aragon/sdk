import { gql } from "graphql-request";

export const QueryTransfers = gql`
query transfers($where: VaultTransfer_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: VaultTransfer_orderBy!) {
  vaultTransfers(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    token {
      id
      name
      symbol
      decimals
    }
    type
    amount
    createdAt
    transaction
    sender
    to
    reference
  }
}
`;
