import { gql } from "graphql-request";

export const QueryTokenVotingSettings = gql`
query TokenVotingSettings($address: ID!) {
  tokenVotingPlugin(id: $address){
    minDuration
    minProposerVotingPower
    minParticipation
    supportThreshold
    votingMode
  }
}
`;
