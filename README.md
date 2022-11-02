# Aragon JS SDK

This folder contains all the JS packages available on NPM:

- [Client](./modules/client)
- [IPFS](./modules/ipfs)
- [Common](./modules/common)

## Available scripts

- `yarn build`
  - Compiles all the modules, respecting their internal dependencies
- `yarn clean`
  - Removes the existing artifacts
- `yarn lint`
  - Checks the current code for inconsistencies
- `yarn test`
  - Runs the test suite on all modules

## Development

Run `yarn build` to compile the individual packages. Run `yarn test` on them.

## Automatic publishing

### With labels

To automatically publish the new version on pull request merge, the relevant labels:
| Label Name | Component getting published | NPM package name |
| --- | --- | --- |
| client-release | `modules/client/` | `@aragon/sdk-client` |
| ipfs-release | `modules/ipfs/` | `@aragon/sdk-ipfs` |
| common-release | `modules/common/` | `@aragon/sdk-common` |

### With tags

To publish a new version of a subpackage create a new git tag following this schema:  
`VERSION-LANGUAGE-PACKAGE_FOLDER_NAME`  
- Example to publish a new version of the javascript client module: `0.0.1-javascript-client`.  
- To publish an alpha version just put `-alpha` behind the semver: `0.0.1-alpha-javascript-client`

#### Important:
**Do not run 2 workflows at the same time, otherwise we could encounter a race condition in the git repo which could lead to a failure of the automatic changelog and package.json update**
