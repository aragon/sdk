import { gql } from "graphql-request";

export const QueryTokenVotingPluginSettings = gql`
query tokenVotingPluginSettings($address: ID!) {
  tokenVotingPlugin(id: $address){
    totalSupportThresholdPct
    relativeSupportThresholdPct
    minDuration
  }
}
`;
