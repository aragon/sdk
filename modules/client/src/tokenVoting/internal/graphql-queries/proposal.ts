import { gql } from "graphql-request";

export const QueryTokenVotingProposal = gql`
query TokenVotingProposal($proposalId: ID!) {
  tokenVotingProposal(id: $proposalId){
    id
    dao {
      id
      subdomain
    }
    creator
    metadata
    createdAt
    creationBlockNumber
    executionDate
    executionBlockNumber
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
    startDate
    endDate
    executed
    earlyExecutable
    potentiallyExecutable
    voters{
      voter{
        address
      }
      voteReplaced
      voteOption
      votingPower
    }
    plugin {
      token {
        id
        name
        symbol
        __typename
        ...on ERC20Contract {
          decimals
        }
      }
    }
    totalVotingPower
    minVotingPower
  }
}
`;
export const QueryTokenVotingProposals = gql`
query TokenVotingProposals($where: TokenVotingProposal_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: TokenVotingProposal_orderBy!) {
  tokenVotingProposals(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    dao {
      id
      subdomain
    }
    creator
    metadata
    yes,
    no,
    abstain
    startDate
    endDate
    executed
    earlyExecutable
    potentiallyExecutable
    votingMode
    supportThreshold
    minVotingPower
    totalVotingPower
    voters{
      voter{
        address
      }
      voteReplaced
      voteOption
      votingPower
    }
    plugin{
      token{
        id
        name
        symbol
        __typename
        ...on ERC20Contract {
          decimals
        }
      }
    }
  }
}
`;
