import { gql } from "graphql-request";

export const QueryAddressListMembers = gql`
query AddressListPluginMembers($address: ID!) {
    addresslistVotingPlugin(id: $address){
        members {
            address
        }
    }
}
`;
