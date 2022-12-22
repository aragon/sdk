import { gql } from "graphql-request";

export const QueryAddressListPluginSettings = gql`
query AddressListPluginSettings($address: ID!) {
  addresslistVotingPlugin(id: $address){
    votingMode
    supportThreshold
    minParticipation
    minDuration
    minProposerVotingPower
  }
}
`;
