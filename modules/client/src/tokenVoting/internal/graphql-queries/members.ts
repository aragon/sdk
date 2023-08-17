import { gql } from "graphql-request";

export const QueryTokenVotingMembers = gql`
  query TokenVotingMembers($address: ID!, $block: Block_height) {
    tokenVotingPlugin(id: $address, block: $block) {
      members {
        address
        balance
        votingPower
        delegatee {
          address
        }
        delegators {
          address
          balance
        }
      }
    }
  }
`;
