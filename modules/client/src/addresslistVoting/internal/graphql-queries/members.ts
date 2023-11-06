import { gql } from "graphql-request";

export const QueryAddresslistVotingMembers = gql`
query AddresslistVotingMembers($where: AddresslistVotingVoter_filter!, $block: Block_height, $limit: Int!, $skip: Int!, $sortBy: AddresslistVotingVoter_orderBy!, $direction: OrderDirection!) {
  addresslistVotingVoters(
    where: $where
    block: $block
    first: $limit
    skip: $skip
    orderBy: $sortBy
    orderDirection: $direction
  ) {
    address
  }
}`;

export const QueryAddresslistVotingIsMember = gql`
query AddresslistVotingIsMember($id: ID!, $block: Block_height) {
  addresslistVotingVoter(
    id: $id
    block: $block
  ) {
    id
  }
}`;
