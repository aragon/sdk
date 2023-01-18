import { gql } from "graphql-request";

export const QueryMultisigProposal = gql`
query multisigProposal($proposalId: ID!) {
  multisigProposal(id: $proposalId){
    id
    dao {
      id
      name
    }
    creator
    metadata
    createdAt
    startDate
    endDate
    actions {
      to
      value
      data
    }
    executed
    approvers{
      approver{
        id
      }
    }
  }
}
`;
export const QueryMultisigProposals = gql`
query multisigProposals($where: MultisigProposal_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: MultisigProposal_orderBy!) {
  multisigProposals(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    dao {
      id
      name
    }
    startDate
    endDate
    creator
    metadata
    executed
  }
}
`;
