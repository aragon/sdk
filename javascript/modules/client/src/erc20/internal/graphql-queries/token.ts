import { gql } from "graphql-request";

export const QueryToken = gql`
query token($address: ID!) {
  erc20VotingPackage(id: $address){
    token {
      id
      name
      symbol
      decimals
    }
  }
}
`;
