import { gql } from "graphql-request";

export const QueryTokenVotingProposal = gql`
query tokenVotingProposal($proposalId: ID!) {
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
    votingMode
    supportThreshold
    minParticipation
    startDate
    endDate
    executed
    executable
    voters{
      voter{
        address
      }
      voteOption
      votingPower
    }
    plugin {
      token {
        id
        name
        symbol
        __typename
        ...on ERC20Token {
          decimals
        }
        ...on ERC721Token {
          baseURI
        }
      }
    }
    totalVotingPower
  }
}
`;
export const QueryTokenVotingProposals = gql`
query tokenVotingProposals($where: TokenVotingProposal_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: TokenVotingProposal_orderBy!) {
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
      }
    }
  }
}
`;
