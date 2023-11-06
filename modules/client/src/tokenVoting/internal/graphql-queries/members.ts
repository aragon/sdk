import { gql } from "graphql-request";

export const QueryTokenVotingMembers = gql`
query TokenVotingMembers($where: TokenVotingMember_filter!, $block: Block_height, $limit: Int!, $skip: Int!, $sortBy: TokenVotingMember_orderBy!, $direction: OrderDirection!) {
  tokenVotingMembers(
    where: $where
    block: $block
    first: $limit
    skip: $skip
    orderBy: $sortBy
    orderDirection: $direction
  ) {
    address
    balance
    votingPower
    delegatee{
      address
    }
    delegators{
      address
      balance
    }
  }
}
`;

export const QueryTokenVotingIsMember = gql`
query TokenVotingIsMember($id: ID!, $block: Block_height) {
  tokenVotingMember(
    id: $id
    block: $block
  ) {
    id
  }
}`;
