import { gql } from "graphql-request";

export const QueryTokenProposal = gql`
query tokenProposal($proposalId: ID!) {
  tokenVotingProposal(id: $proposalId){
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
    yes,
    no,
    abstain
    totalSupportThresholdPct,
    relativeSupportThresholdPct,
    startDate
    endDate
    executed
    executable
    voters{
      voter{
        id
      }
      vote
      weight
    }
    plugin{
      token{
        symbol
        name
        id
        decimals
      }
    }
    census
  }
}
`;
export const QueryTokenProposals = gql`
query tokenProposals($where: TokenVotingProposal_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: TokenVotingProposal_orderBy!) {
  tokenVotingProposals(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    dao {
      id
      name
    }
    creator
    metadata
    yes,
    no,
    abstain
    startDate
    endDate
    executed
    executable
    plugin{
      token{
        symbol
        name
        id
        decimals
      }
    }
  }
}
`;
