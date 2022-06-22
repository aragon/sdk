# Aragon SDK

This repository contains the Softward Development Kit to interact with the Aragon protocol.

It currently provides support for:
- [JavaScript - TypeScript](./javascript)

## Automatic publishing

### With labels

To automatically publish the new version on pull request merge add one or all of these labels:
| Label Name | Package that gets published | NPM package name |
| --- | --- | --- |
| client-publish | `javascript/modules/client/` | `@aragon/sdk-client` |
| common-publish | `javascript/modules/common/` | `@aragon/sdk-common` |

### With tags

The available components are:

- Client package
  - `client:patch`, `client:minor`, `client:major`
- Common package
  - `common:patch`, `common:minor`, `common:major`

### General tags

The version in the package.json gets automatically updated and written back into the develop branch.  
**Do not run 2 workflows at the same time, otherwise we could encounter a race condition in the git repo which could lead to a failure of the automatic changelog and package.json update**
