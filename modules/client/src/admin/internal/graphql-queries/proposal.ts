import { gql } from "graphql-request";

export const QueryAdminProposal = gql`
query adminProposal($proposalId: ID!) {
  adminProposal(id: $proposalId){
    id
    dao {
      id
      name
    }
    creator
    metadata
    createdAt
    actions {
      to
      value
      data
    }
    executed
    plugin {
      address
    }
    administrator {
      address
    }
    proposalId
  }
}
`;
export const QueryAdminProposals = gql`
query adminProposals($where: Admin!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: AdminProposal_orderBy!) {
  adminProposals(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    dao {
      id
      name
    }
    creator
    metadata
    createdAt
    executed
    administrator {
      address
    }
  }
}
`;
