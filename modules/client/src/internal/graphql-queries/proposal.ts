import { gql } from "graphql-request";

export const QueryIProposal = gql`
query IProposal($id: String!) {
    iproposal(id: $id) {
        dao {
            id
        }
        actions {
            to
            value
            data
        }
    }
}
`;
