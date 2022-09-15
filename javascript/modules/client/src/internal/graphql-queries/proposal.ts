import { gql } from "graphql-request";

export const QueryErc20Proposal = gql`
query erc20VotingProposal($proposalId: ID!) {
  erc20VotingProposal(id: $proposalId){
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
    yea,
    nay,
    abstain
    supportRequiredPct,
    participationRequiredPct,
    startDate
    endDate
    executed
    votingPower
    voters{
      voter{
        id
      }
      vote
      weight
    }
    pkg{
			token{
        symbol
        name
        id
        decimals
      }
    }
    votingPower
  }
}
`;
