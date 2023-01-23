import { gql } from "graphql-request";

export const QueryAddresslistVotingMembers = gql`
query AddresslistVotingMembers($address: ID!) {
    addresslistVotingPlugin(id: $address){
        members {
            address
        }
    }
}
`;
