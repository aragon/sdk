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
    actions {
      to
      value
      data
    }
    executed
    appovals {
      {
        id
      }
    }
  }
}
`;
export const QueryMultisigProposals = gql`
query multisigProposals($where: ERC20VotingProposal_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: ERC20VotingProposal_orderBy!) {
  multisigProposals(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    dao {
      id
      name
    }
    creator
    metadata
    executed
  }
}
`;
