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
    releases(orderBy: release, orderDirection: desc, first: 1){
      release
      metadata
      builds(orderBy: build, orderDirection: desc, first: 1){
        build
        metadata
      }
    }
  }
}
`;

export const QueryIPlugin = gql`
query IPlugin($address: ID!, $where: IPlugin_filter!) {
	iplugin(id:$address, where:$where){
    installations(where:{state: Installed}) {
      appliedPreparation{
        helpers
        pluginRepo {
          id
        }
      }
     	appliedVersion {
        metadata
        build
        release{
          release
        }
      }
    }   
  }
}
`;

export const QueryPluginUpdatePreparations = gql`
query PluginUpdatePreparations($where: PluginUpdatePreparation_filter!, $build: Int!, $release: Int!) {
  pluginPreparations(where: $where){
    helpers
    pluginRepo{
      id
      releases (where: { release: $release }) {
        builds (where: { build: $build })  {
          pluginSetup {
            id
          }
        }
      }
    }
  }
}
`;