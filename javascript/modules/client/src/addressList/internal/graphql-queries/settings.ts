import { gql } from "graphql-request";

export const QueryAddressListPluginSettings = gql`
query AddressListPluginSettings($address: ID!) {
  allowlistPackage(id: $address){
    supportRequiredPct
    participationRequiredPct
    minDuration
  }
}
`;
