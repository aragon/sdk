import { gql } from "graphql-request";

export const QueryAddresslistVotingSettings = gql`
  query AddresslistVotingSettings($address: ID!, $block: Block_height) {
    addresslistVotingPlugin(id: $address, block: $block) {
      minDuration
      minProposerVotingPower
      minParticipation
      supportThreshold
      votingMode
    }
  }
`;
