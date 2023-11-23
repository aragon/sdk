import { gql } from "graphql-request";

export const QueryDao = gql`
  query Dao($address: ID!) {
    dao(id: $address){
      id
      subdomain
      metadata
      createdAt
      plugins{
        appliedPreparation {
          pluginAddress
        }
        appliedPluginRepo {
          subdomain
        }
        appliedVersion{
          build
          release {
            release
          }
        }
      }
    }
  }
`;
export const QueryDaos = gql`
  query Daos ($limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: Dao_orderBy!) {
    daos(first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
      id
      subdomain
      metadata
      plugins{
        appliedPreparation {
          pluginAddress
        }
        appliedPluginRepo {
          subdomain
        }
        appliedVersion{
          build
          release {
            release
          }
        }
      }
    }
  }
`;
