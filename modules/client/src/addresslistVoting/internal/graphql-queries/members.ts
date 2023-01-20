import { gql } from "graphql-request";

export const QueryAddressListVotingMembers = gql`
query AddressListVotingPluginMembers($address: ID!) {
    addresslistVotingPlugin(id: $address){
        members {
            address
        }
    }
}
`;
