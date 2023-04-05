import { gql } from "graphql-request";

export const QueryMultisigProposal = gql`
query MultisigProposal($proposalId: ID!) {
  multisigProposal(id: $proposalId){
    id
    dao {
      id
      subdomain
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
    executionDate
    executionBlockNumber
    creationBlockNumber
    plugin {
      onlyListed
    }
    minApprovals
    executionTxHash
    executed
    potentiallyExecutable
    approvers{
      id
    }
  }
}
`;
export const QueryMultisigProposals = gql`
query MultisigProposals($where: MultisigProposal_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: MultisigProposal_orderBy!) {
  multisigProposals(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    dao {
      id
      subdomain
    }
    creator
    metadata
    executed
    potentiallyExecutable
    approvals
    startDate
    endDate
    executionDate
    executionBlockNumber
    creationBlockNumber
    approvers {
      id
    }
    minApprovals
    plugin{
      onlyListed
    }
  }
}
`;
