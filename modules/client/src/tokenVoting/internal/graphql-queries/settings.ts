import { gql } from "graphql-request";

export const QueryTokenVotingSettings = gql`
query TokenVotingSettings($address: ID!,$block: Block_height) {
  tokenVotingPlugin(id: $address, block: $block){
    minDuration
    minProposerVotingPower
    minParticipation
    supportThreshold
    votingMode
  }
}
`;
