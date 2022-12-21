import { gql } from "graphql-request";

export const QueryAddressListVotingSettings = gql`
query AddressListVotingSettings($address: ID!) {
  addresslistPlugin(id: $address){
    totalSupportThresholdPct
    relativeSupportThresholdPct
    minDuration
  }
}
`;
