import { gql } from "graphql-request";

export const QueryAddresslistVotingMembers = gql`
query AddresslistVotingPluginMembers($address: ID!) {
    addresslistVotingPlugin(id: $address){
        members {
            address
        }
    }
}
`;
