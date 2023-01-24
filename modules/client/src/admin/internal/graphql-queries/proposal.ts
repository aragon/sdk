import { gql } from "graphql-request";

// TODO
// fix adminstrator typo once is fixed in subgraph

export const QueryAdminProposal = gql`
query adminProposal($proposalId: ID!) {
  adminProposal(id: $proposalId) {
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
      id
    }
    adminstrator {
      address
    }
    proposalId
  }
}
`;
export const QueryAdminProposals = gql`
query adminProposals($where: AdminProposal_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: AdminProposal_orderBy!) {
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
    adminstrator {
      address
    }
  }
}
`;
