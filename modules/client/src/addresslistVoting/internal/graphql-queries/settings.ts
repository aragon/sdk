import { gql } from "graphql-request";

export const QueryAddresslistVotingSettings = gql`
query AddresslistVotingSettings($address: ID!) {
  addresslistVotingPlugin(id: $address){
    minDuration
    minProposerVotingPower
    minParticipation
    supportThreshold
    votingMode
  }
}
`;
