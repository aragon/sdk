# Aragon JS SDK

This folder contains all the JS packages available on NPM:
- [Client](./modules/client)
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


<!--
This library aims to provide utility classes and methods to invoke decentralized operations within a voting process. It covers the typical functionality of Client applications, as well as the Process Manager or the Census Manager.

The intended functionality is to interact with a public Ethereum blockchain, to fetch data from a decentralized filesystem, to enforce data schema validity, to prepare vote packages and using decentralized messaging networks through Gateways.

This library implements the protocol defined on https://docs.vocdoni.io/architecture/components.html

## Getting started

```sh
npm install dvote-js ethers
```

DVoteJS is a superset of smaller NPM packages that can be installed individually:

- [`@vocdoni/client`](packages/client/README.md)
- [`@vocdoni/voting`](packages/voting/README.md)
- [`@vocdoni/census`](packages/census/README.md)
- [`@vocdoni/contract-wrappers`](packages/contract-wrappers/README.md)
- [`@vocdoni/common`](packages/common/README.md)
- [`@vocdoni/data-models`](packages/data-models/README.md)
- [`@vocdoni/encryption`](packages/encryption/README.md)
- [`@vocdoni/wallets`](packages/wallets/README.md)
- [`@vocdoni/signing`](packages/signing/README.md)
- [`@vocdoni/hashing`](packages/hashing/README.md)

If you are developing a frontend application using React, you can check out [@vocdoni/react-hooks](https://github.com/vocdoni/react-hooks).

**Ethers**

The library is tightly coupled with [ethers.js](https://docs.ethers.io/ethers.js/html/) in order to sign payloads, communicate with Web3 endpoints and attach to physical/virtual wallets.

**Signers** and **Wallets** are both used to sign Web3 transactions, as well as authenticating DVote requests

- To interact with the Ethereum blockchain, a [Provider](https://docs.ethers.io/ethers.js/html/api-providers.html) is needed.
- In order to send transactions a [Wallet](https://docs.ethers.io/ethers.js/html/api-wallet.html) or a [Signer](https://docs.ethers.io/ethers.js/html/api-wallet.html#signer-api) (like Metamask) are needed to sign.

### Using providers

Ethers.js providers can connect using different sources.

<details>
<summary>Example</summary>

```javascript
const ethers = require("ethers")   // NodeJS
import { providers } from "ethers"    // ES6 Browser

// Well-known
const provider = ethers.getDefaultProvider('homestead') // mainnet

// Etherscan
const altProvider = new providers.EtherscanProvider('ropsten')

// Using injected web3 on a browser
const web3Provider1 = new providers.Web3Provider(web3.currentProvider)

const currentProvider2 = new web3.providers.HttpProvider('http://localhost:8545')
const web3Provider2 = new providers.Web3Provider(currentProvider2)
```
</details>

[More information](https://docs.ethers.io/ethers.js/html/api-providers.html#connecting-to-ethereum)

### Wallets

Generating a wallet from a mnemonic (and an optional path and Web3 provider):

<details>
<summary>Example</summary>

```typescript
const { WalletUtil } = require("dvote-js")
const mnemonic = "my mnemonic ..."
const mnemonicPath = "m/44'/60'/0'/0/0"
const provider = ethers.getDefaultProvider('goerli')

const wallet = WalletUtil.fromMnemonic(mnemonic, mnemonicPath, provider)
wallet.sendTransaction(...)
// ...
```

</details>

Generating a standalone deterministic wallet from a passphrase and a (non-private) seed. They are intended to provide wallets where the private key can be accessed.

<details>
<summary>Example</summary>

```typescript
const { Random, WalletUtil } = require("dvote-js")
const provider = ethers.getDefaultProvider('goerli')

// Created from scratch
const hexSeed = Random.getHex()  // could be stored locally
const passphrase = "A very Difficult 1234 passphrase" // must be private and include upper/lowercase chars and numbers

// Or using an already created seed
const hexSeed = "0xfdbc446f9f3ea732d23c7bcd10c784d041887d48ebc392c4ff51882ae569ca15"
const passphrase = "A very Difficult 1234 passphrase" // must be private and include upper/lowercase chars and numbers

const wallet = WalletUtil.fromSeededPassphrase(passphrase, hexSeed, provider)
wallet.signMessage(...)
// ...
```
</details>

Accessing the browser wallet or MetaMask:

<details>
<summary>Example</summary>

```typescript
const { SignerUtil } = require("dvote-js")
const signer = SignerUtil.fromInjectedWeb3()
signer.sendTransaction(...)
```
</details>

## Components

### Entity / Organization

The entity API allows reading and managing the metadata of an organization. On top of a key-value store, lies a link to the entity's metadata, which is the human readable information about it.

### Process

A Voting process contains a group of settings defining how an L2 governance process is conducted on the Vochain.

In addition to the flags there is also the process metadata, which is the human readable content that voters will be prompted for making a choice.

### Gateway

Provides utility functions to fetch data from decentralized filesystems, sending messages and adding files to IPFS.

## Examples

See the examples for different use cases:

- [example/signed-off-chain](example/signed-off-chain)
- [example/signed-erc20](example/signed-erc20)
- [example/signed-erc20-signal](example/signed-erc20-signal)
- [example/signed-blind](example/signed-blind)
-->

## Development

Run `yarn build` to compile the individual packages. Run `yarn test` on them.
