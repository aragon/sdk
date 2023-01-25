import { gql } from "graphql-request";

export const QueryMultisigMembers = gql`
query MultisigMembers($address: ID!) {
    multisigPlugin(id: $address){
        members {
            address
        }
    }
}
`;
