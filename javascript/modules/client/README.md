Aragon JS SDK Client
---

@aragon/sdk-client provides easy access to the high level interactions to be
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

## Context

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

## General purpose client

The [Client](./src/client.ts) class allows to perform operations that apply to
all DAO's, regardless of the plugins they use.

```ts
import { Client } from "@aragon/sdk-client";

const client = new Client(context);
```

### Creating a DAO

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

### Depositing ETH to a DAO

Handles the flow of depositing the native EVM token to an Aragon DAO.

```ts
import { DaoDepositSteps, IDepositParams } from "@aragon/sdk-client";

const client = new Client(context);

const depositParams: IDepositParams = {
  daoAddress: "0x1234...",
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

### Depositing ERC20 tokens to a DAO

Handles the flow of depositing ERC20 tokens to a DAO.

- Similar to the example above
- The `tokenAddress` field is required
- Will attempt to increase the ERC20 allowance if not sufficient
- More intermediate steps are yielded

```ts
import { Client, DaoDepositSteps, IDepositParams } from "@aragon/sdk-client";

const client = new Client(context);

const depositParams: IDepositParams = {
  daoAddress: "0x1234...",
  tokenAddress: "0x2345...", // Token contract address
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
    case DaoDepositSteps.UPDATING_ALLOWANCE:
      console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
      break;
    case DaoDepositSteps.UPDATED_ALLOWANCE:
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

### Loading Multiple DAOs

Handles retrieving list of DAO metadata.

```ts
import { Client } from "@aragon/sdk-client";

const client = new Client(context);
const options = {
	orderBy: OrderBy.POPULARITY,
	limit: 10
}

const result = await client.methods.getDaos(options);
console.log(result);

/*
[{
   address: "0x1234...",
   avatar: "http...",
   createdAt: <Date>,
   description: "This dao...",
   links: [{description: "Website", url: "http..."}],
   name: "Abc Dao",
   plugins: ["0x1245...", "0x3456..."],
}, {...}]
*/
```


### Loading DAO details

Handles retrieving DAO metadata using its address or ENS domain.

```ts
import { Client } from "@aragon/sdk-client";

const client = new Client(context);
const doaAddressOrEns = "0x1234..."; // unique identifier; dao ENS domain or address

const metadata = await client.methods.getMetadata(doaAddressOrEns);
console.log(metadata);

/*
{
   address: "0x1234...",
   avatar: "http...",
   createdAt: <Date>,
   description: "This dao...",
   links: [{description: "Website", url: "http..."}],
   name: "Abc Dao",
   plugins: ["0x1245...", "0x3456..."],
} */
```

### Loading DAO activity

- **TODO**: Transactions

### Loading DAO financial data

Handles retrieving DAO asset balances using the DAO address or its ENS domain.

```ts
import { Client } from "@aragon/sdk-client";
const client = new Client(context);
const daoAddressOrEns = "0x1234..."; // unique identifier; dao ENS domain or address
const balances = await client.methods.getBalances(daoAddressOrEns);
console.log(balances);
/* 
[{
  type: "native"
  "balance": 1000000000000000n,
  "lastUpdate": <Date>
},{
  "type": "erc20"
  "address": "0x123...",
  "name": "TestToken",
  "symbol": "TST",
  "decimals": "18"
  "balance": 1000000000000000n,
  "lastUpdate": <Date>
}, ...] */
```

Retrieves the list of transfers made from and to a certain DAO.

```ts
import { Client } from "@aragon/sdk-client";
const client = new Client(context);
const daoAddressOrEns = "0x1234...";
const transfers = await client.methods.getTransfers(daoAddressOrEns);
console.log(transfers);
/*
{ 
  "deposits": [{
    "type": "native"
    "from":"0x1234...",
    "amount": 1000000000000000n,
    "reference": "",
    "transactionId": "0x1234...",
    "date": <Date>
  },...],
  "withdrawals": [{
    "type": "erc20"
    "address": "0x123...",
    "name": "TestToken",
    "symbol": "TST",
    "decimals": "18"
    "to":"0x1234...",
    "amount": 1000000000000000n,
    "reference": "",
    "transactionId": "0x1234...",
    "date": <Date>
  }, ...]
}
*/
```

## ERC20 governance plugin client

This is a `Client`-like class, tailored to suit the specific use cases of the
built-in ERC20 voting DAO Plugin.

Similarly to the above class, it provides high level methods that abstract the
underlying network requests.

### Creating a DAO with an ERC20 plugin

- **TODO**

### Creating an ERC20 proposal

```ts
import {
  ClientErc20,
  DaoAction,
  ICreateProposalParams,
  VoteOption,
} from "@aragon/sdk-client";

const client = new ClientErc20(context);

const actions: DaoAction[] = [
  // See the "Action encoders" section below
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

const estimatedGas = await client.estimation.createProposal(
  proposalCreationParams,
);
console.log(estimatedGas.average); // bigint
console.log(estimatedGas.max); // bigint

for await (
  const step of client.methods.createProposal(
    proposalCreationParams,
  )
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

### Voting on an ERC20 proposal

- **TODO**

### Loading the list of members (ERC20)

Retrieving all the members of an ERC20 DAO.

```ts
import { ClientErc20 } from "@aragon/sdk-client";

const client = new ClientERC20(context);
const doaAddressOrEns = "0x1234..."; // unique identifier; dao ENS domain or address

const members = await client.methods.getMembers(daoAddressOrEns);

console.log(members); // ["0x3585...", "0x1235...", "0x6785...",]
```

### Loading the list of proposals (ERC20)

Retrieving the proposals of an ERC20 DAO.

```ts
import { Client } from "@aragon/sdk-client";

const client = new Client(context);
const doaAddressOrEns = "0x1234...";

const proposals = await client.methods.getProposals(doaAddressOrEns);
console.log(proposals);

/*
 [ {
    id: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7_0x0",
    daoAddress: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7",
    daoName: "DAO 1",
    creator: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",

    startDate: <Date>,
    endDate: <Date>,
    createdAt: <Date>,

    title: "New Founding for Lorex Lab SubDao",
    summary: "As most community members know, Aragon has strived.",
    proposal: "This is the super important proposal body",
    resources: [{ url: "https://example.com", description: "Example" }],

    voteId: "0",
    token: {
      address: "0x9df6870250396e10d187b188b8bd9179ba1a9c18",
      name: "DAO Token",
      symbol: "DAO",
      decimals: 18,
    },

    result: {
      yea: 3,
      nay: 1,
      abstain: 2,
    },

    open: false,
    executed: false,
    status: "Pending",

    config: {
      participationRequiredPct: 30,
      supportRequiredPct: 52,
    },

    votingPower: 135,

    voters: [
      {
        address: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",
        voteValue: VoteOptions.YEA,
        weight: 1,
      },
      {...}
    ],
  },] */
```

## Multisig governance plugin client

### Creating a DAO with a multisig plugin

- **TODO**

### Creating a multisig proposal

- **TODO**

### Voting on a multisig proposal

- **TODO**

### Loading the list of members (multisig)

- **TODO**

### Loading the list of proposals (multisig)

- **TODO**

## Action encoders

Proposals will eventually need to execute some action on behalf of the DAO,
which needs to be encoded in a low level format.

The helpers above help encoding the most typical DAO operations.

### Withdrawals

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

# Development

The building blocks are defined within the `src/internal` folder. The high level client wrappers are implemented in `src/client*.ts`

## Low level networking

See `ClientCore` ([source](./src/internal/core.ts)):

- Abstract class implementing primitives for:
  - Web3, contracts, signing
  - IPFS
  - GraphQL
- Inherited by classes like `Client` and all plugin classes like `ClientErc20`.

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
`constructor` and follows the structure of [ClientErc20](./src/client-erc20.ts).

# Testing

To execute library tests just run:

```bash
yarn test
```
