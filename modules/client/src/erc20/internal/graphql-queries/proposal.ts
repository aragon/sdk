import { gql } from "graphql-request";

export const QueryErc20Proposal = gql`
query erc20Proposal($proposalId: ID!) {
  erc20VotingProposal(id: $proposalId){
    id
    dao {
      id
      name
    }
    creator
    metadata
    createdAt
    creationDate
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
    executionDate
    executionBlockNumber
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
export const QueryErc20Proposals = gql`
query erc20Proposals($where: ERC20VotingProposal_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: ERC20VotingProposal_orderBy!) {
  erc20VotingProposals(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
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
