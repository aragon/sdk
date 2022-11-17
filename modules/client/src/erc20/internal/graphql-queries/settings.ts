import { gql } from "graphql-request";

export const QueryErc20PluginSettings = gql`
query erc20PluginSettings($address: ID!) {
  erc20VotingPlugin(id: $address){
    supportRequiredPct
    participationRequiredPct
    minDuration
  }
}
`;
