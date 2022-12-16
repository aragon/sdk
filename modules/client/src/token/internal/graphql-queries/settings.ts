import { gql } from "graphql-request";

export const QueryErc20PluginSettings = gql`
query erc20PluginSettings($address: ID!) {
  erc20VotingPlugin(id: $address){
    totalSupportThresholdPct
    relativeSupportThresholdPct
    minDuration
  }
}
`;
