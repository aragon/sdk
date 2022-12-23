import { gql } from "graphql-request";

export const QueryTokenVotingToken = gql`
query token($address: ID!) {
  tokenVotingVotingPlugin(id: $address){
    token {
      id
      name
      symbol
      decimals
    }
  }
}
`;
