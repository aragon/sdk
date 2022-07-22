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
