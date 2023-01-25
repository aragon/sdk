import { gql } from "graphql-request";

export const QueryMultisigVotingSettings = gql`
query MultisigVotingSettings($address: ID!) {
    multisigPlugin(id: $address){
        minApprovals
        onlyListed
    }
}
`;
