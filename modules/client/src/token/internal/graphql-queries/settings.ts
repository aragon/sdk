import { gql } from "graphql-request";

export const QueryTokenPluginSettings = gql`
query tokenPluginSettings($address: ID!) {
  tokenVotingPlugin(id: $address){
    votingMode
    supportThreshold
    minParticipation
    minDuration
    minProposerVotingPower
  }
}
`;
