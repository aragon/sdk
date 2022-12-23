import { gql } from "graphql-request";

export const QueryToken = gql`
query token($address: ID!) {
  tokenVotingPlugin(id: $address){
    token {
      id
      name
      symbol
      decimals
    }
  }
}
`;
