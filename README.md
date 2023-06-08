![Aragon](https://res.cloudinary.com/dacofvu8m/image/upload/v1677353961/Aragon%20CodeArena/osx_blue_logo_lqrvkr.png)

# Aragon JS SDK

Welcome to the Aragon JS SDK! This SDK allows you to interact with Aragon OSx
using JavaScript. Whether you are a developer wanting to build on top of Aragon,
or looking to contribute to the SDK itself, you are in the right place! This
folder contains all the JS packages available on NPM:

- [Client](./modules/client)
- [IPFS](./modules/ipfs)
- [Common](./modules/common)

## Developer Quick Start

The Aragon OSx SDK is Javascript agnostic, which means you can use it with any
Javascript framework, including popular ones like React, Vite, or Vue. The
examples in this readme are written using NodeJS

First things first install the client with

```sh
yarn add @aragon/sdk-client
```

or

```sh
npm install @aragon/sdk-client
```

Then, you'll want to set up the Aragon OSx SDK context within your application
to have access to the SDK functions.

```typescript
// 1. Create a context
const minimalContextParams = {
  network: "mainnet",
  web3Providers: "https://rpc.ankr.com/eth",
  signer: Wallet.createRandom(),
};

const context = new Context(minimalContextParams);
```

Next thing you'll want to do is set up the general purpose client so you can
call on the SDK functions. This client is used to interact with any DAO on the
network you're connected to.

```typescript
const client = new Client(context);
```

Now test its all working by fetching an array of DAOs

```typescript
console.log(await client.methods.getDaos({ limit: 5 }));
```

returns

```typescript
[
  {
    address: "0xf2d594f3c93c19d7b1a6f15b5489ffce4b01f7da",
    ensDomain: "management.dao.eth",
    metadata: {
      name: "(the DAO has no metadata)",
      description: "(the DAO did not define any content)",
      avatar: undefined,
    },
    plugins: [[Object]],
  },
  // ...
];
```

checkout the [SDK Docs](https://devs.aragon.org/docs/sdk) for more info.

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

To automatically publish the new version on pull request merge, the relevant
labels: | Label Name | Component getting published | NPM package name | | --- |
--- | --- | | client-release | `modules/client/` | `@aragon/sdk-client` | |
ipfs-release | `modules/ipfs/` | `@aragon/sdk-ipfs` | | common-release |
`modules/common/` | `@aragon/sdk-common` |

### With tags

To publish a new version of a subpackage create a new git tag following this
schema:\
`VERSION-LANGUAGE-PACKAGE_FOLDER_NAME`

- Example to publish a new version of the javascript client module:
  `0.0.1-javascript-client`.
- To publish an alpha version just put `-alpha` behind the semver:
  `0.0.1-alpha-javascript-client`

#### Important:

**Do not run 2 workflows at the same time, otherwise we could encounter a race
condition in the git repo which could lead to a failure of the automatic
changelog and package.json update**
