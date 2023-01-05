import { gql } from "graphql-request";

export const QueryTokenVotingPluginSettings = gql`
query tokenVotingPluginSettings($address: ID!) {
  tokenVotingPlugin(id: $address){
    minDuration
    minProposerVotingPower
    minParticipation
    supportThreshold
    votingMode
  }
}
`;
