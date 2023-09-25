# Aragon JS SDK Client

`@aragon/sdk-client` provides easy access to the high level interactions to be
made with an Aragon DAO. It consists of three different components:

- General-purpose DAO client
- Custom clients for specific DAO plugins
- Context for holding inheritable configuration

Contributors: See [development](#development) below

# Installation

Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install
@aragon/sdk-client.

```bash
npm install @aragon/sdk-client
yarn add @aragon/sdk-client
```

# Usage

The SDK usage is demonstrated in the [SDK examples section of the Developer Portal](https://devs.aragon.org/docs/sdk/examples/).

## React Native
In order for the SDK to be used in restricted environments like react native install the following polyfilesand  into your project:  
-  [@ethersproject/shims](https://www.npmjs.com/package/@ethersproject/shims)
-  [react-native-url-polyfill](https://www.npmjs.com/package/react-native-url-polyfill)

Then import them like the following **before** you import the Aragon SDK package:  
```javascript
import "@ethersproject/shims";
import "react-native-url-polyfill/auto";
import { Client } from "@aragon/sdk-client";
```

# Development

The building blocks are defined within the `src/internal` folder. The high level
client wrappers are implemented in `src/client*.ts`

## Low level networking

See `ClientCore` ([source](./src/internal/core.ts)):

- Abstract class implementing primitives for:
  - Web3, contracts, signing
  - IPFS
  - GraphQL
- Inherited by classes like `Client` and all plugin classes like `TokenVotingClient`.

## Common interfaces, types, enum's

When updating a `ClientXXX` (plugin) class:

- **Update first** all affected enum's, types and interfaces in
  `src/internal/interfaces.ts`

When updating the `Client` class:

- **Update first** all affected enum's, types and interfaces in
  `src/internal/interfaces.ts`

## Developing a new Plugin client

Create a new class that `extends` from `ClientCore`, receives a `Context` on the
`constructor` and follows the structure of [TokenVotingClient](./src/tokenVoting/client.ts).

# Testing

To execute library tests just run:

```bash
yarn test
```

## Security

If you believe you've found a security issue, we encourage you to notify us. We welcome working with you to resolve the issue promptly.

Security Contact Email: sirt@aragon.org

Please do not use the issue tracker for security issues.