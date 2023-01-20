import { gql } from "graphql-request";

export const QueryAddressListVotingPluginSettings = gql`
query AddressListVotingPluginSettings($address: ID!) {
  addresslistVotingPlugin(id: $address){
    minDuration
    minProposerVotingPower
    minParticipation
    supportThreshold
    votingMode
  }
}
`;
