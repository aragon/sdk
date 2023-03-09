---
title: Aragon SDK
sidebar_label: Intro
sidebar_position: 0
---

## The JavaScript/TypeScript SDK for Aragon OSx

`@aragon/sdk-client` provides easy access to the high level interactions to be
made with an Aragon DAO. It consists of three different components:

- General-purpose DAO client
- Custom clients for specific DAO plugins
- Context for holding inheritable configuration

Contributors: See [development](#development) below

### Installation

Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install
@aragon/sdk-client.

```bash
npm install @aragon/sdk-client
yarn add @aragon/sdk-client
```

### Usage

The use of the different SDK features and methods is demonstrated in the [Examples (coming soon)](./01-examples/index.md) section.

An extensive documentation of the different clients can be found in the auto-generated [Reference Guide](./02-reference-guide/index.md) section.

#### React Native

In order for the SDK to be used in restricted environments like react native install the following polyfills into your project:

- [@ethersproject/shims](https://www.npmjs.com/package/@ethersproject/shims)
- [react-native-url-polyfill](https://www.npmjs.com/package/react-native-url-polyfill)

Then import them like the following **before** you import the Aragon SDK package:

```javascript
import '@ethersproject/shims';
import 'react-native-url-polyfill/auto';
import {Client} from '@aragon/sdk-client';
```

### Development

The building blocks are defined within the `src/internal` folder. The high level
client wrappers are implemented in `src/client*.ts`

#### Low level networking

See `ClientCore` (`/src/internal/core.ts`):

- Abstract class implementing primitives for:
  - Web3, contracts, signing
  - IPFS
  - GraphQL
- Inherited by classes like `Client` and all plugin classes like `TokenVotingClient`.

#### Common interfaces, types, enums

When updating a `ClientXXX` (plugin) class:

- **Update first** all affected enums, types and interfaces in
  `src/internal/interfaces/plugins.ts`

When updating the `Client` class:

- **Update first** all affected enums, types and interfaces in
  `src/internal/interfaces/client.ts`

When updating the `ClientCore` class:

- **Update first** all affected enums, types and interfaces in
  `src/internal/interfaces/core.ts`

#### Developing a new Plugin client

Create a new class that `extends` from `ClientCore`, receives a `Context` on the
`constructor` and follows the structure of `TokenVotingClient` (`./src/tokenVoting/client.ts`).
