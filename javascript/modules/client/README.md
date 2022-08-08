# Aragon JS SDK Client

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
  : {
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
  sortBy: DaosSortBy.POPULARITY,
  limit: 10,
};

const result = await client.methods.getDaos(options);
console.log(result);

/*
[{
   address: "0x1234...",
   avatar: "http...",
   creatonDate: <Date>,
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

const metadata = await client.methods.getDao(doaAddressOrEns);
console.log(metadata);

/*
{
   address: "0x1234...",
   avatar: "http...",
   creatonDate: <Date>,
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

## ERC20 governance plugin client


### Creating an ERC20 client

```ts
import {
  ClientErc20,
  Client,
  Context
  ContextParams,
  ContextPlugin
} from "@aragon/sdk-client";

const contextParams: ContextParams = {
  // network id or name
  network: 31337,
  signer: new Wallet("0x..."),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0xf8065dD2dAE72D4A8e74D8BB0c8252F3A9acE7f9",
  web3Providers: ["http://localhost:8545"],
  pluginAddress: "0x2345678901234567890123456789012345678901",
  ipfsNodes: [
    {
      url: "http:localhost:5001",
    },
  ],
  graphqlURLs: ["https://the-subgraph-url.io"]
}
// create a simple context
const context: Context = new Context(contextParams)
// create a plugin context from the simple context and the plugin address
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
// create the multisig client
const client = new ClientErc20(context)
```
### Creating a DAO with an ERC20 plugin

```ts
import {
  ContextPlugin,
  Client,
  Erc20Client,
  IErc20PluginInstall,
  ICreateParams
} from "@aragon/sdk-client";
// create context
const context = new Context(params)
// create clients
const client = new Client(context) 
const pluginInitParams: IErc20PluginInstall = {
  proposals: {
    minDuration: 7200, // seconds
    minTurnout: 0.25, // between 0 and 1
    minSupport: 0.5 // between 0 and 1
  },
  useToken:{
    address: "0x..."
  }
};
// OR
// const pluginInitParams: IErc20PluginInstall = {
//   proposals: {
//     minDuration: 7200,
//     minTurnout: 0.5,
//     minSupport: 0.5
//   },
//   newToken: {
//     name: "Token",
//     symbol: "TOK",
//     decimals: 18,
//     // minter: "0x...",
//     balances: [
//       {
//         address: "0x...",
//         balance: BigInt(10)
//       },
//       {
//         address: "0x...",
//         balance: BigInt(10)
//       },
//       {
//         address: "0x...",
//         balance: BigInt(10)
//       },
//     ]
//   }
// }
const erc20InitAction = ClientErc20.encoding.installEntry(pluginInitParams)
// create DAO params with the init action in the plugins field
const params: ICreateParams = {
  daoConfig: {
    name: "The Dao",
    metadata: {...daoMetadata}
  },
  plugins: [...otherPlugins, erc20InitAction]
}
// estimate gas
const estimatedGas = await client.estimation.create(
  params,
);
console.log(estimatedGas.average); // bigint
console.log(estimatedGas.max); // bigint
// create DAO
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

### Creating an ERC20 proposal

```ts
import {
  ClientErc20,
  DaoAction,
  ICreateProposal,
  VoteOption,
  ContextPlugin,
  ProposalCreationSteps
} from "@aragon/sdk-client";
// context
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientErc20(contextPlugin);

// actions to execute if the proposal is apporved
const actions: DaoAction[] = [
  // See the "Action encoders" section below
  { to: "0x1234...", value: BigInt(100), data: new Uint8Array([1, 2, 3, 4]) },
];
// proposal params
const proposalCreationParams: ICreateProposal = {
  metadataUri: "<uri>", // Following the EIP-4824
  actions,
  startDate: new Date(), // Date
  endDate: new Date(),  // Date
  executeOnPass: true,
  creatorVote: VoteOption.YES,
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
  try {
    switch (step.idx) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash); // 0xb1c14a49...
        break;
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId); // 0x1234...
        break;
    }
  }
  catch (err){
    // ...err
  }
}
```

### Voting on an ERC20 proposal

```ts
import {
  ClientErc20,
  DaoAction,
  ICreateProposal,
  VoteOption,
  ContextPlugin,
  VoteProposalStep
} from "@aragon/sdk-client";
// context
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientErc20(contextPlugin);

// gas estimation
const estimatedGas = await client.estimation.voteProposal(
  proposalId, VoteOptions.YES
);
console.log(estimatedGas.average); // bigint
console.log(estimatedGas.max); // bigint

for await (const step of client.methods.voteProposal(proposalId, VoteOptions.YES)) {
  try {
    switch (step.key) {
    case VoteProposalStep.VOTING:
        console.log(step.txHash); // 0xb1c14a49...
      break;
    case VoteProposalStep.DONE:
        console.log(step.voteId); // 0x12345...
      break;
    }
  } catch (err) {
    // ...
  }
}
```

### Loading the list of members (ERC20)

Retrieving all the members of an ERC20 DAO.

```ts
import { ClientErc20, ContextPlugin } from "@aragon/sdk-client";
// create client
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientErc20(contextPlugin);

const members = await client.methods.getMembers();

console.log(members); // ["0x3585...", "0x1235...", "0x6785...",]
```

### Retrieve a proposal by proposalID (ERC20)

Retrieving the proposals of an ERC20 DAO.

```ts
import { ClientErc20, ContextPlugin } from "@aragon/sdk-client";
// create client
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientErc20(contextPlugin);

const proposalId = "0x1234567..._0x0"

const proposal = await client.methods.getProposal(proposalId);
console.log(proposal);

/*
  {
    id: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7_0x0",
    daoAddress: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7",
    daoName: "DAO 1",
    creatorAddress: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",

    startDate: <Date>,
    endDate: <Date>,
    creatonDate: <Date>,

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
      yes: 3,
      no: 1,
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
        voteValue: VoteOptions.YES,
        weight: 1,
      },
      {...}
    ],
  }
*/
```
### Loading the list of proposals (ERC20)

Retrieving the proposals of an ERC20 DAO.

```ts
import { ClientErc20, ContextPlugin } from "@aragon/sdk-client";
// create client
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientErc20(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0,
  limit: 10,
  direction: SortDirection.ASC,
  sortBy: Proposal.sortBy.POPULARITY,
  addresOrEns: "", // Filter by dao address or ens
}

const proposals = await client.methods.getProposals(queryParams);
console.log(proposals);

/*
 [ {
    id: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7_0x0",
    daoAddress: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7",
    daoName: "DAO 1",
    creatorAddress: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",

    startDate: <Date>,
    endDate: <Date>,
    creatonDate: <Date>,

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
      yes: 3,
      no: 1,
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
        voteValue: VoteOptions.YES,
        weight: 1,
      },
      {...}
    ],
  },] */
```

## Multisig governance plugin client

```ts
import {
  ClientMultisig,
  Client,
  Context
  ContextParams,
  ContextPlugin
} from "@aragon/sdk-client";

const contextParams: ContextParams = {
  // network id or name
  network: 31337,
  signer: new Wallet("0x..."),
  dao: "0x1234567890123456789012345678901234567890",
  daoFactoryAddress: "0xf8065dD2dAE72D4A8e74D8BB0c8252F3A9acE7f9",
  web3Providers: ["http://localhost:8545"],
  pluginAddress: "0x2345678901234567890123456789012345678901",
  ipfsNodes: [
    {
      url: "http:localhost:5001",
    },
  ],
  graphqlURLs: ["https://the-subgraph-url.io"]
}
// create a simple context
const context: Context = new Context(contextParams)
// create a plugin context from the simple context and the plugin address
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
// create the multisig client
const client = new ClientMultisig(context)
```

### Creating a DAO with a multisig plugin

```ts
import {
  ContextPlugin,
  Client,
  MultisigClient,
  IMultisigFactoryParams,
  ICreateParams
} from "@aragon/sdk-client";
// create clients
const client = new Client(context) 
// create init action for the erc20 plugin
const pluginInitParams: IMultisigPluginInstall = {
  votingConfig: {
    minDuration: 7200, // seconds
    minTurnout: 0.25, // between 0 and 1
    minSupport: 0.5 // between 0 and 1
  },
  addresses: [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123",
  ]
};
// create initialize action for the dao
const multisigInitAction = ClientMultisig.encoding.installEntry(pluginInitParams)
// create DAO params with the init action in the plugins field
const params: ICreateParams = {
  daoConfig: {
    name: "The Dao",
    metadata: {...daoMetadata}
  },
  gsnForwarder: "",
  plugins: [...otherPlugins, multisigInitAction]
}
// estimate gas
const estimatedGas = await client.estimation.create(
  params,
);
console.log(estimatedGas.average); // bigint
console.log(estimatedGas.max); // bigint
// create DAO
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

### Creating a Multisig proposal
```ts
import {
  ClientMultisig,
  DaoAction,
  ICreateProposal,
  VoteOption,
  ContextPlugin,
  ProposalCreationSteps
} from "@aragon/sdk-client";
// context
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientMultisig(contextPlugin);

// actions to execute if the proposal is apporved
const actions: DaoAction[] = [
  // See the "Action encoders" section below
  { to: "0x1234...", value: BigInt(100), data: new Uint8Array([1, 2, 3, 4]) },
];
// proposal params
const proposalCreationParams: ICreateProposal = {
  metadataUri: "<uri>", // Following the EIP-4824
  actions,
  startDate: new Date(), // Date
  endDate: new Date(),  // Date
  executeOnPass: true,
  creatorVote: VoteOption.YES,
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
  try {
    switch (step.idx) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash); // 0xb1c14a49...
        break;
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId); // 0x1234...
        break;
    }
  }
  catch (err){
    // ...err
  }
}
```

### Voting on a Multisig proposal
```ts
import {
  ClientMultisig,
  DaoAction,
  ICreateProposal,
  VoteOption,
  ContextPlugin,
  VoteProposalStep
} from "@aragon/sdk-client";
// context
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientMultisig(contextPlugin);

// gas estimation
const estimatedGas = await client.estimation.voteProposal(
  proposalId, VoteOptions.YES
);
console.log(estimatedGas.average); // bigint
console.log(estimatedGas.max); // bigint

for await (const step of client.methods.voteProposal(proposalId, VoteOptions.YES)) {
  try {
    switch (step.key) {
    case VoteProposalStep.VOTING:
        console.log(step.txHash); // 0xb1c14a49...
      break;
    case VoteProposalStep.DONE:
        console.log(step.voteId); // 0x12345...
      break;
    }
  } catch (err) {
    // ...
  }
}
```

### Loading the list of members (Multisig)
```ts
import { ClientMultisig, ContextPlugin } from "@aragon/sdk-client";
// create client
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientMultisig(contextPlugin);

const members = await client.methods.getMembers();

console.log(members); // ["0x3585...", "0x1235...", "0x6785...",]

```

### Loading the a proposal by proposalId (Multisig)
```ts
import { ClientMultisig, ContextPlugin } from "@aragon/sdk-client";
// create client
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientMultisig(contextPlugin);

const proposalId = "0x1234567..._0x0"

const proposal = await client.methods.getProposal(proposalId);
console.log(proposal);
  /*
    {
      id: "0x1234567890123456789012345678901234567890_0x0",
      daoAddress: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7",
      daoName: "DAO 1",
      creatorAddress: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",

      startDate: <Date>,
      endDate: <Date>,
      creatonDate: <Date>,

      title: "New Founding for Lorex Lab SubDao",
      summary: "As most community members know, Aragon has strived.",
      proposal: "This is the super important proposal body",
      resources: [{ url: "https://example.com", description: "Example" }],

      voteId: "0",

      result: {
        yes: 3,
        no: 1,
        abstain: 2,
      },

      open: false,
      executed: false,
      status: "Pending",

      config: {
        participationRequiredPct: 30,
        supportRequiredPct: 52,
      },

      voters: [
        {
          address: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",
          voteValue: VoteOptions.YES,
          weight: 1,
        },
        {...}
      ],
    },
  */

```
### Loading the list of proposals (Multisig)
```ts
import { ClientMultisig, ContextPlugin } from "@aragon/sdk-client";
// create client
const contextPlugin = ContextPlugin.fromContext(context, "0x...")
const client = new ClientMultisig(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0,
  limit: 10,
  direction: SortDirection.ASC,
  sortBy: Proposal.sortBy.POPULARITY,
  addresOrEns: "", // Filter by dao address or ens
}

const proposals = await client.methods.getProposals(queryParams);
console.log(proposals);
  /*
    [ 
      {
        id: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7_0x0",
        daoAddress: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7",
        daoName: "DAO 1",
        creatorAddress: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",

        startDate: <Date>,
        endDate: <Date>,
        creatonDate: <Date>,

        title: "New Founding for Lorex Lab SubDao",
        summary: "As most community members know, Aragon has strived.",
        proposal: "This is the super important proposal body",
        resources: [{ url: "https://example.com", description: "Example" }],

        voteId: "0",

        result: {
          yes: 3,
          no: 1,
          abstain: 2,
        },

        open: false,
        executed: false,
        status: "Pending",

        config: {
          participationRequiredPct: 30,
          supportRequiredPct: 52,
        },

        voters: [
          {
            address: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",
            voteValue: VoteOptions.YES,
            weight: 1,
          },
          {...}
        ],
      },
    ]
  */

```

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

const withdrawAction = await client.encoding.withdrawAction(
  "0x1234567890123456789012345678901234567890",  
  withdrawParams
);
console.log(withdrawAction);
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
