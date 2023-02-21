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

An exhaustive list of the SDK features and methods can be found on the **[examples.md](examples.md) file**.

To generate the `examples.md` file run `yarn examples`

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
  `src/internal/interfaces/plugins.ts`

When updating the `Client` class:

- **Update first** all affected enum's, types and interfaces in
  `src/internal/interfaces/client.ts`

When updating the `ClientCore` class:

- **Update first** all affected enum's, types and interfaces in
  `src/internal/interfaces/core.ts`

## Developing a new Plugin client

Create a new class that `extends` from `ClientCore`, receives a `Context` on the
`constructor` and follows the structure of [TokenVotingClient](./src/tokenVoting/client.ts).

# Testing

To execute library tests just run:

```bash
yarn test
```
