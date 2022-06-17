# @aragon/sdk-client

@aragon/sdk-client provides easy access to the high level interactions to be
made with an Aragon DAO. It consists of three different components:

- General-purpose DAO client
- Custom clients for specific DAO plugins
- Context for holding inheritable configuration

Contributors: See [development](#development) below

## Installation

Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install
@aragon/sdk-client.

```bash
npm install @aragon/sdk-client
yarn add @aragon/sdk-client
```

## Usage

### Context

The [Context](./src/context.ts) class is an utility component that holds the
configuration passed to any [Client](./src/client.ts) instance.

```ts
import { Context } from "@aragon/sdk-client";

// Define
const contextParams: ContextParams = {
  network: 31337,
  signer: new Wallet("privateKey"),
  // Optional on "rinkeby", "arbitrum-rinkeby" or "mumbai"
  daoFactoryAddress: "0x1234...",
  web3Providers: ["http://localhost:8545"],
};

// Instantiate
const context = new Context(contextParams);

// Update
context.set({ network: 1 });
context.set({ signer });
context.setFull(contextParams);
context.useWeb3Providers(["http://server:8545"], "mainnet");
```

### General purpose client

The [Client](./src/client.ts) class allows to perform operations that apply to
all DAO's, regardless of the plugins they use.

```ts
import { Client } from "@aragon/sdk-client";

const client = new Client(context);
```

#### Creating a DAO

```ts
import { DaoCreationSteps, ICreateParams } from "@aragon/sdk-client";

const creationParams: ICreateParams = {
  daoConfig: {
    name: "ERC20VotingDAO_" + Math.floor(Math.random() * 9999) + 1,
    metadata: "<ipfs-http-uri>",
  },
  votingConfig: {
    minSupport: Math.floor(Math.random() * 100) + 1,
    minParticipation: Math.floor(Math.random() * 100) + 1,
    minDuration: Math.floor(Math.random() * 9999) + 1,
  },
  gsnForwarder: Wallet.createRandom().address,
};

const estimatedGas = await client.estimation.create(creationParams);
console.log(estimatedGas.average); // bigint
console.log(estimatedGas.max); // bigint

// Steps
for await (const step of client.methods.create(creationParams)) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        // Transaction waiting on the mempool
        console.log(step.txHash);
        break;
      case DaoCreationSteps.DONE:
        // DAO address
        console.log(step.address);
        break;
    }
  } catch (err) {
    // ...
  }
}
```

#### Depositing ETH to a DAO

Handles the flow of depositing the native EVM token to an Aragon DAO.

```ts
import { DaoDepositSteps, IDepositParams } from "@aragon/sdk-client";

const client = new Client(context);

const depositParams: IDepositParams = {
  daoAddress: "0x1234...",
  token: null, // or leave empty
  amount: BigInt(1000), // Ether amount in wei
  reference: "Your memo goes here", // Optional
};

const estimatedGas = await client.estimation.deposit(depositParams);
console.log(estimatedGas.average); // bigint
console.log(estimatedGas.max); // bigint

for await (const step of client.methods.deposit(depositParams)) {
  switch (step.idx) {
    case DaoDepositSteps.DEPOSITING:
      console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
      break;
    case DaoDepositSteps.DONE:
      console.log(step.amount); // 1000n
      break;
  }
}
```

#### Depositing ERC20 tokens to a DAO

Handles the flow of depositing ERC20 tokens to a DAO.

- Similar to the example above
- The `token` field is now required
- Will attempt to increase the ERC20 allowance if not sufficient
- More fintermediate steps are yielded

```ts
import { Client, DaoDepositSteps, IDepositParams } from "@aragon/sdk-client";

const client = new Client(context);

const depositParams: IDepositParams = {
  daoAddress: "0x1234...",
  token: "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877", // Token contract address
  amount: BigInt(1000), // Ether amount in wei
  reference: "Your memo goes here", // Optional
};

const estimatedGas = await client.estimation.deposit(depositParams);
console.log(estimatedGas.average); // bigint
console.log(estimatedGas.max); // bigint

for await (const step of client.methods.deposit(depositParams)) {
  switch (step.idx) {
    case DaoDepositSteps.CHECKED_ALLOWANCE:
      console.log(step.allowance); // 0n
      break;
    case DaoDepositSteps.INCREASING_ALLOWANCE:
      console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
      break;
    case DaoDepositSteps.INCREASED_ALLOWANCE:
      console.log(step.allowance); // 1000n
      break;
    case DaoDepositSteps.DEPOSITING:
      console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
      break;
    case DaoDepositSteps.DONE:
      console.log(step.amount); // 1000n
      break;
  }
}
```

---
---

#### TODO:

Add methods for:

- Reading DAO metadata
- Reading DAO Dashboard info
  - List of installed plugin ID's
- Reading DAO finance
  - Assets
  - Current market value (?)

(other)

---
---

### ERC20 governance plugin client

This is a `Client`-like class, tailored to suit the specific use cases of the
built-in ERC20 voting DAO Plugin.

Similarly to the above class, it provides high level methods that abstract the
underlying network requests.

#### Creating a DAO with an ERC20 plugin

- TO DO

#### Creating an ERC20 proposal

```ts
import {
  ClientErc20,
  DaoAction,
  ICreateProposalParams,
  VoteOption,
} from "@aragon/sdk-client";

const client = new ClientErc20(context);

const actions: DaoAction[] = [
  // See action builders below
  { to: "0x1234...", value: BigInt(100), data: new Uint8Array([1, 2, 3, 4]) },
];
const proposalCreationParams: ICreateProposalParams = {
  metadataUri: "<uri>", // Following the EIP-4824
  actions,
  // TODO: Clarify => block number or timestamp?
  startDate: 1234,
  endDate: 2345,
  executeIfPassed: true,
  creatorVote: VoteOption.YEA,
};

const estimatedGas = await client.estimation.createProposal(proposalCreationParams);
console.log(estimatedGas.average); // bigint
console.log(estimatedGas.max); // bigint

for await (
  const step of client.methods.createProposal(proposalCreationParams)
) {
  switch (step.idx) {
    case DaoDepositSteps.CREATING:
      console.log(step.txHash); // 0xb1c14a49...
      break;
    case DaoDepositSteps.DONE:
      console.log(step.proposalId); // 0x1234...
      break;
  }
}
```

#### Voting on an ERC20 proposal

- TO DO

### Multisig governance plugin client

#### Creating a DAO with a multisig plugin

- TO DO

#### Creating a multisig proposal

- TO DO

#### Voting on a multisig proposal

- TO DO


### Action encoders

Proposals will eventually need to execute some action on behalf of the DAO, which needs to be encoded in a low level format. 

The helpers above help encoding the most typical DAO operations.

#### Withdrawals

```ts
import { Client } from "@aragon/sdk-client";

const client = new Client(context);

const withdrawParams: IWithdrawParams = {
  recipientAddress: "0x1234...", // Recipient
  amount: BigInt(10),
  // tokenAddress: "0x2345...",  (required for sending ERC20 tokens)
  reference: "Some withdrawal message",
};

const withdrawAction = client.encoding.withdrawAction(withdrawParams);
console.log(withdrawAction);
```

## Testing

To execute library tests just run:

```bash
yarn test
```
