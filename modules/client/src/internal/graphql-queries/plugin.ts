import { gql } from "graphql-request";

export const QueryPlugins = gql`
query Plugins($where: PluginRepo_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: PluginRepo_orderBy!) {
  pluginRepos(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    subdomain
    releases{
      release
      metadata
      builds{
        build
      }
    }
  }
}
`;
export const QueryPlugin = gql`
query Plugin($id: ID!) {
  pluginRepo(id:$id){
    subdomain
    releases(orderBy: release, orderDirection: desc){
      release
      metadata
      builds(orderBy: build, orderDirection: desc){
        build
        metadata
      }
    }
  }
}
`;
