import { gql } from "graphql-request";

export const status = gql`
{
  _meta{
    deployment
  }
}
`