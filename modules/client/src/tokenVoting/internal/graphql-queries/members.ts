import { gql } from "graphql-request";

export const QueryTokenVotingMembers = gql`
query TokenVotingPluginMembers($address: ID!) {
    tokenVotingPlugin(id: $address){
        members {
            address
        }
    }
}
`;
