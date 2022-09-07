# Aragon SDK

This repository contains the Softward Development Kit to interact with the Aragon protocol.

It currently provides support for:
- [JavaScript - TypeScript](./javascript)

## Automatic publishing

### With labels

To automatically publish the new version on pull request merge, the relevant labels:
| Label Name | Component getting published | NPM package name |
| --- | --- | --- |
| client-release | `javascript/modules/client/` | `@aragon/sdk-client` |
| ipfs-release | `javascript/modules/ipfs/` | `@aragon/sdk-ipfs` |
| common-release | `javascript/modules/common/` | `@aragon/sdk-common` |

### With tags

To publish a new version of a subpackage create a new git tag following this schema:  
`VERSION-LANGUAGE-PACKAGE_FOLDER_NAME`  
- Example to publish a new version of the javascript client module: `0.0.1-javascript-client`.  
- To publish an alpha version just put `-alpha` behind the semver: `0.0.1-alpha-javascript-client`

#### Important:
**Do not run 2 workflows at the same time, otherwise we could encounter a race condition in the git repo which could lead to a failure of the automatic changelog and package.json update**
