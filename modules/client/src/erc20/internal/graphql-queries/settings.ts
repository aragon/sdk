import { gql } from "graphql-request";

export const QueryErc20VotingSettings = gql`
query erc20VotingSettings($address: ID!) {
  erc20VotingPlugin(id: $address){
    totalSupportThresholdPct
    relativeSupportThresholdPct
    minDuration
  }
}
`;
