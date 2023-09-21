import { gql } from "graphql-request";

export const QueryIProposal = gql`
  query IProposal($id: ID!) {
    iproposal(id: $id){
        id
        dao {
            id
        }
        actions{
            to
            value
            data
        }
    }
  }
`;