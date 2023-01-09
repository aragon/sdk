import { gql } from "graphql-request";

export const QueryTokenVotingTargetContract = gql`
query token($address: ID!) {
  tokenVotingPlugin(id: $address){
    token {
      id
      name
      symbol
      __typename
      ...on ERC20Token {
        decimals
      }
      ...on ERC721Token {
        baseURI
      }
    }
  }
}
`;
