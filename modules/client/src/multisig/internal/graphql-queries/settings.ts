import { gql } from "graphql-request";

export const QueryMultisigVotingSettings = gql`
query MultisigVotingSettings($address: ID!) {
    multisigPlugin(id: $address){
        members {
            address
        }
        minApprovals
        onlyListed
    }
}
`;
