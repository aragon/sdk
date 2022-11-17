import { gql } from "graphql-request";

export const QueryAddressListPluginSettings = gql`
query AddressListPluginSettings($address: ID!) {
  addresslistPlugin(id: $address){
    totalSupportThresholdPct
    relativeSupportThresholdPct
    minDuration
  }
}
`;
