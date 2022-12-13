import { gql } from "graphql-request";

export const QueryAddressListMembers = gql`
query AddressListPluginMembers($address: ID!) {
    addresslistPlugin(id: $address){
        members {
            address
        }
    }
}
`;
