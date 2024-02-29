import { gql } from "graphql-request";

export const QueryPlugins = gql`
query Plugins($where: PluginRepo_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: PluginRepo_orderBy!) {
  pluginRepos(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    subdomain
    releases (orderBy: release, orderDirection: desc){
      release
      metadata
      builds (orderBy: build, orderDirection: desc) {
        build
        metadata
      }
    }
  }
}
`;

export const QueryPlugin = gql`
query Plugin($id: ID!) {
  pluginRepo(id:$id){
    id
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

export const QueryPluginPreparations = gql`
query PluginPreparations($where: PluginPreparation_filter!) {
  pluginPreparations(where: $where){
    data
  }
}
`;

export const QueryPluginPreparationsExtended = gql`
query PluginPreparations($where: PluginPreparation_filter!, $limit: Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: PluginPreparation_orderBy!) {
  pluginPreparations(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    type
    creator
    dao {
      id
    }
    pluginRepo {
      id
      subdomain
    }
    pluginVersion{
      build
      release{
        release
      }
    }
    pluginAddress
    permissions {
      id
      operation
      where
      who
      condition
    }
    helpers
    data
  }
}
`;

export const QueryPluginInstallations = gql`
  query PluginInstallations($where: PluginInstallation_filter!) {
    pluginInstallations(where: $where) {
      id
    }
  }`;
