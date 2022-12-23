import { gql } from "graphql-request";

export const QueryTokenPluginSettings = gql`
query tokenPluginSettings($address: ID!) {
  tokenVotingPlugin(id: $address){
    totalSupportThresholdPct
    relativeSupportThresholdPct
    minDuration
  }
}
`;
