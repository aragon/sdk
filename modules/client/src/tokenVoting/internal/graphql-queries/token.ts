import { gql } from "graphql-request";

export const QueryTokenVotingPlugin = gql`
query TokenVotingPlugin($address: ID!) {
  tokenVotingPlugin(id: $address){
    token {
      id
      name
      symbol
      __typename
      ...on ERC20WrapperContract {
        decimals
        underlyingToken{
          id
          name
          symbol
          decimals
        }
      }
      ...on ERC20Contract {
        decimals
      }
    }
  }
}
`;
