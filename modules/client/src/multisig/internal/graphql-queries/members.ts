import { gql } from "graphql-request";

export const QueryMultisigMembers = gql`
query MultisigPluginMembers($address: ID!) {
    multisigPlugin(id: $address){
        members {
            address
        }
    }
}
`;
