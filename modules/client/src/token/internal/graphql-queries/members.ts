import { gql } from "graphql-request";

export const QueryErc20Members = gql`
query Erc20PluginMembers($address: ID!) {
    erc20VotingPlugin(id: $address){
        members {
            address
        }
    }
}
`;
