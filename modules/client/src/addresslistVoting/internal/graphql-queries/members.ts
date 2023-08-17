import { gql } from "graphql-request";

export const QueryAddresslistVotingMembers = gql`
  query AddresslistVotingMembers($address: ID!, $block: Block_height) {
    addresslistVotingPlugin(id: $address, block: $block) {
      members {
        address
      }
    }
  }
`;
