import { gql } from "graphql-request";

export const QueryMultisigSettings = gql`
query MultisigPluginSettings($address: ID!) {
    multisigPlugin(id: $address){
        members {
            address
        }
        minApprovals
    }
}
`;
