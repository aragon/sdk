import { gql } from "graphql-request";

export const QueryTokenMembers = gql`
query TokenPluginMembers($address: ID!) {
    tokenVotingPlugin(id: $address){
        members {
            address
        }
    }
}
`;
