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

## Context

The [Context](./src/context.ts) class is an utility component that holds the
configuration passed to any [Client](./src/client.ts) instance.

```ts
import { Context } from "@aragon/sdk-client";

// Define
const contextParams: ContextParams = {
  network: "mainnet",
  signer: new Wallet("privateKey"),
  // Optional on "rinkeby", "arbitrum-rinkeby" or "mumbai"
  daoFactoryAddress: "0x1234...",
  web3Providers: ["https://cloudflare-eth.com/"],
  ipfsNodes: [{
    url: "https://testing-ipfs-0.aragon.network/api/v0",
    headers: { "X-API-KEY": IPFS_API_KEY || "" }
  }],
  graphqlNodes: [{ url: "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby" }]
};

// Instantiate
const context = new Context(contextParams)

// Update
context.set({ network: 1 })
context.set({ signer })
context.setFull(contextParams)
context.useWeb3Providers(["http://server:8545"], "mainnet")
```

## General purpose client

The [Client](./src/client.ts) class allows to perform operations that apply to
all DAO's, regardless of the plugins they use.

```ts
import { Client, ContextParams } from "@aragon/sdk-client"

const contextParams: ContextParams = { ... }
// Can be stored in a singleton and inherited from there
const context: Context = new Context(contextParams)

const client = new Client(context)
// ...
```

### Creating a DAO

```ts
import { Client, Context, DaoCreationSteps, ICreateParams, GasFeeEstimation } from "@aragon/sdk-client"
import { Wallet } from 'ethers'

const context: Context = new Context(params)
const client: Client = new Client(context)
const createParams: ICreateParams = {
  metadata: {
    name: "My DAO",
    description: "This is a description",
    avatar: "",
    links: [{
      name: "Web site",
      url: "https://..."
    }]
  },
  ensSubdomain: "my-org", // my-org.dao.eth,
  plugins: []
}

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.create(createParams)
console.log(estimatedGas.average)
console.log(estimatedGas.max)

const steps = client.methods.create(createParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log(step.txHash)
        break
      case DaoCreationSteps.DONE:
        console.log(step.address)
        break
    }
  } catch (err) {
    console.error(err)
  }
}
```

### Depositing ETH to a DAO

Handles the flow of depositing the native EVM token to an Aragon DAO.

```ts
import { Client, Context, DaoDepositSteps, IDepositParams, GasFeeEstimation } from "@aragon/sdk-client"
import { Wallet } from 'ethers'


const context: Context = new Context(params)
const client: Client = new Client(context)
const depositParams: IDepositParams = {
  daoAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount in wei
  reference: "test deposit" // optional
}

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(depositParams)
console.log(estimatedGas.average)
console.log(estimatedGas.max)

const steps = client.methods.deposit(depositParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoDepositSteps.DEPOSITING:
        console.log(step.txHash) // 0xb1c14a49...3e8620b0f5832d61c
        break
      case DaoDepositSteps.DONE:
        console.log(step.amount) // 10n
        break
    }
  } catch (err) {
    console.error(err)
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
import { Client, Context, DaoDepositSteps, GasFeeEstimation, IDepositParams, } from "@aragon/sdk-client"
import { Wallet } from 'ethers'



const context = new Context(params)
const client = new Client(context)
const depositParams: IDepositParams = {
  daoAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
  reference: "test deposit" // optional
}

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(depositParams)
console.log(estimatedGas.average)
console.log(estimatedGas.max)

const steps = client.methods.deposit(depositParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoDepositSteps.CHECKED_ALLOWANCE:
        console.log(step.allowance); // 0n
        break;
      case DaoDepositSteps.UPDATING_ALLOWANCE:
        console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
        break;
      case DaoDepositSteps.UPDATED_ALLOWANCE:
        console.log(step.allowance); // 10n
        break;
      case DaoDepositSteps.DEPOSITING:
        console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
        break;
      case DaoDepositSteps.DONE:
        console.log(step.amount); // 10n
        break;
    }
  } catch (err) {
    console.error(err)
  }
}
```

### Loading Multiple DAOs

Handles retrieving list of DAO metadata.

```ts
import { Client, Context, SortDirection, DaoListItem, DaoSortBy, IDaoQueryParams } from "@aragon/sdk-client";
import { Wallet } from 'ethers'


const context: Context = new Context(params)
const client: Client = new Client(context)
const queryParams: IDaoQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: DaoSortBy.POPULARITY //optional
}
const daos: DaoListItem[] = await client.methods.getDaos(queryParams)
console.log(daos)
/*
[
  {
    address: "0x12345...",
    ensDomain: "test.dao.eth",
    metadata: {
        name: "Test",
        description: "This is a description"
    };
    plugins: [
      {
        id: "erc20-voting.plugin.dao.eth",
        instanceAddress: "0x12345..."
      }
    ]
  },
  {
    address: "0x12345...",
    ensDomain: "test-1.dao.eth", // on mainnet
    metadata: {
        name: "Test 1",
        description: "This is a description 1"
    };
    plugins: [
      {
        id: "addressList-voting.plugin.dao.eth",
        instanceAddress: "0x12345..."
      }
    ]
  },
  {
    address: "0x12345...",
    ensDomain: "test-2.dao.eth",
    metadata: {
        name: "Test 2",
        description: "This is a description 2"
    };
    plugins: [
      {
        id: "erc20-voting.plugin.dao.eth",
        instanceAddress: "0x12345..."
      }
    ]
  }
]
*/
```

### Loading DAO details

Handles retrieving DAO metadata using its address or ENS domain.

```ts
import { Client, Context, DaoDetails } from "@aragon/sdk-client";
import { Wallet } from 'ethers'


const context: Context = new Context(params)
const client: Client = new Client(context)
const dao: DaoDetails = await client.methods.getDao("test.dao.eth")
// const dao: DaoDetails = await client.methods.getDao("0x12345...")
console.log(dao)
/*
{
  address: "0x12345...",
  ensDomain: "test.dao.eth",
  metadata: {
      name: "test",
      description: "this is a description",
      avatar?: "https://wbsite.com/image.jpeg",
      links: [
        {
          name: "Website",
          url: "https://website..."
        },
        {
          name: "Discord",
          url: "https://discord.com/..."
        }
      ];
  };
  creationDate: <Date>,
  plugins: [
    {
      id: erc20-voting.plugin.dao.eth,
      instanceAddress: "0x12345..."
    }
  ]
}
*/
```

### Loading DAO activity
Retrieves the list of asset transfers to and from the given DAO (by default, from ETH, DAI, USDC and USDT, on Mainnet)

```ts
import { Client, Context } from "@aragon/sdk-client";
import { Wallet } from 'ethers'


const context: Context = new Context(params)
const client: Client = new Client(context)
const daoAddressOrEns = "0x12345..."
const transfers = await client.methods.getTransfers(daoAddressOrEns)
console.log(transfers)


 /*
 deposits: [
  {
    type: "erc20",
    address: "0x1234567890...",
    name: "Token",
    symbol: "TOK",
    decimals: 10,
    from: "0x123456789...",
    amount: 10n,
    reference: "Some reference",
    transactionId: "0x1234567890...",
    date: <Date>
  },
  {
    type: "native",
    from: "0x123456789...",
    amount: 100n,
    reference: "Some reference 2",
    transactionId: "0x1234567890...",
    date: <Date>
  }
 ],
 withdrawals: [
  {
    type: "erc20",
    address: "0x1234567890...",
    name: "Token",
    symbol: "TOK",
    decimals: 10,
    from: "0x123456789...",
    amount: 10n,
    reference: "Some reference",
    transactionId: "0x1234567890...",
    date: <Date>
  },
  {
    type: "native",
    from: "0x123456789...",
    amount: 100n,
    reference: "Some reference 2",
    transactionId: "0x1234567890...",
    date: <Date>
  }
 ]
 */
```

### Loading DAO financial data

Handles retrieving DAO asset balances using the DAO address or its ENS domain.

```ts
import { Client, Context, AssetBalance } from "@aragon/sdk-client";
import { Wallet } from 'ethers'


const context: Context = new Context(params)
const client: Client = new Client(context)
const daoAddressOrEns = "0x12345..."
const tokenAddresses = [ // Optional: Token addresses in addition to the common ones
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123"
]
const balances: AssetBalance[] = await client.methods.getBalances(daoAddressOrEns, tokenAddresses)
console.log(balances)
/*
  [
    {
      type: "native",
      balance: 100000n,
      lastUpdate: <Date>
    },
    {
      type: "erc20",
      address: "0x1234567890123456789012345678901234567890"
      name: "The Token",
      symbol: "TOK",
      decimals: 18,
      balance: 200000n
      lastUpdate: <Date>
    },
    ...
  ]
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
import { Client, Context, DaoCreationSteps, ICreateParams, IErc20PluginInstall, GasFeeEstimation, ClientErc20 } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

const context: Context = new Context(params)
const client: Client = new Client(context)

// Define the plugins to install and their params

// Use an already existing ERC20 token
const pluginInitParams1: IErc20PluginInstall = {
  settings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minTurnout: 0.25, // 25%
    minSupport: 0.5 // 50%
  },
  useToken: {
    address: "0x..."
  }
};
// Mint a new token
const pluginInitParams2: IErc20PluginInstall = {
  settings: {
    minDuration: 60 * 60 * 24,  // seconds
    minTurnout: 0.4, // 40%
    minSupport: 0.55 // 55%
  },
  newToken: {
    name: "Token",
    symbol: "TOK",
    decimals: 18,
    minter: "0x...",  // optionally, define a minter
    balances: [
      { // Initial balances of the new token
        address: "0x...",
        balance: BigInt(10)
      },
      {
        address: "0x...",
        balance: BigInt(10)
      },
      {
        address: "0x...",
        balance: BigInt(10)
      },
    ]
  }
}
const erc20InstallPluginItem1 = ClientErc20.encoding.getPluginInstallItem(pluginInitParams1)
const erc20InstallPluginItem2 = ClientErc20.encoding.getPluginInstallItem(pluginInitParams2)

const createParams: ICreateParams = {
  metadata: {
    name: "My DAO",
    description: "This is a description",
    avatar: "https://...",
    links: [{
      name: "Web site",
      url: "https://..."
    }]
  },
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [erc20InstallPluginItem1, erc20InstallPluginItem2]
}

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.create(createParams)
console.log(estimatedGas.average)
console.log(estimatedGas.max)

const steps = client.methods.create(createParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log(step.txHash)
        break
      case DaoCreationSteps.DONE:
        console.log(step.address)
        break
    }
  } catch (err) {
    console.error(err)
  }
}
```

### Creating an ERC20 proposal

```ts
import { ClientErc20, Context, ContextPlugin, ICreateProposalParams, ProposalCreationSteps, VoteValues } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an ERC20 client
const client = new ClientErc20(contextPlugin)

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x123456789012345678901234567890123456789012",
  metadata: {
    title: "Test Proposal",
    summary: "This is a short description",
    description: "This is a long description",
    resources: [
      {
        name: "Discord",
        url: "https://discord.com/..."
      },
      {
        name: "Website",
        url: "https://website..."
      }
    ],
    media: {
      logo: "https://...",
      header: "https://..."
    }
  },
  actions: [],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES
}

const steps = client.methods.createProposal(proposalParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash)
        break
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId)
        break
    }
  } catch (err) {
    console.error(err)
  }
}
```

### Creating an ERC20 proposal with an action

```ts
import { ClientErc20, Context, ContextPlugin, ICreateProposalParams, ProposalCreationSteps, VoteValues, IProposalSettings } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an ERC20 client
const client = new ClientErc20(contextPlugin)

// create config action
const configActionPrarms: IProposalSettings = {
  minDuration: 60 * 60 * 24,
  minSupport: 0.3, // 30%
  minTurnout: 0.5 // 50%
}

const configAction = client.encoding.updatePluginSettingsAction(configActionPrarms)

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x123456789012345678901234567890123456789012",
  metadata: {
    title: "Test Proposal",
    summary: "This is a short description",
    description: "This is a long descrioption",
    resources: [
      {
        name: "Discord",
        url: "https://discord.com/..."
      },
      {
        name: "Website",
        url: "https://website..."
      }
    ],
    media: {
      logo: "https://...",
      header: "https://..."
    }
  },
  actions: [configAction],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES
}

const steps = client.methods.createProposal(proposalParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash)
        break
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId)
        break
    }
  } catch (err) {
    console.error(err)
  }
}
```

### Voting on an ERC20 proposal

```ts
import { ClientErc20, Context, ContextPlugin, VoteProposalStep, VoteValues } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an ERC20 client
const client = new ClientErc20(contextPlugin)

const voteParams: IVoteProposalParams = {
  pluginAddress: "0x123456789012345678901234567890123456789012",
  proposalId: '0x1234567890123456789012345678901234567890',
  vote: VoteValues.YES
}

const steps = client.methods.voteProposal(voteParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case VoteProposalStep.VOTING:
        console.log(step.txHash)
        break
      case VoteProposalStep.DONE:
        console.log(step.voteId)
        break
    }
  } catch (err) {
    console.error(err)
  }
}
```

### Loading the list of members (ERC20)

Retrieving all the members of an ERC20 DAO.

```ts
import { ClientErc20, Context, ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an ERC20 client
const client = new ClientErc20(contextPlugin)

const daoAddressorEns = "0x12345..."

const memebers: string[] = await client.methods.getMembers(daoAddressorEns)
console.log(memebers)
/*
[
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
  "0x5678901234567890123456789012345678901234",
]
*/
```

### Retrieve a proposal by proposalID (ERC20)

Retrieving the proposals of an ERC20 DAO.

```ts
import { ClientErc20, Context, ContextPlugin, Erc20Proposal } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an ERC20 client
const client = new ClientErc20(contextPlugin)

const proposalId = "0x12345..."

const proposal: Erc20Proposal = await client.methods.getProposal(proposalId)
console.log(proposal)
/*
{
  id: "0x12345...",
  dao: {
    address: "0x1234567890123456789012345678901234567890",
    name: "Cool DAO"
  };
  creatorAddress: "0x1234567890123456789012345678901234567890",
  metadata: {
    title: "Test Proposal",
    summary: "test proposal summary",
    description: "this is a long description",
    resources: [
      {
        url: "https://dicord.com/...",
        name: "Discord"
      },
      {
        url: "https://docs.com/...",
        "name: "Document"
      }
    ],
    media: {
      header: "https://.../image.jpeg",
      logo: "https://.../image.jpeg"
    }
  };
  startDate: <Date>,
  endDate: <Date>,
  creationDate: <Date>,
  actions: [
    {
      to: "0x12345..."
      value: 10n
      data: [12,13,154...]
    }
  ],
  result {
    yes: 700000n,
    no: 300000n,
    abstain: 0n
  }
  settings:{
    minTurnout: 0.5,
    minSupport: 0.25,
    minDuration: 7200
  },
  token: {
    address: "0x1234567890123456789012345678901234567890,
    name: "The Token",
    symbol: "TOK",
    decimals: 18
  },
  usedVotingWeight: 1000000n,
  votes: [
    {
      address: "0x123456789123456789123456789123456789",
      vote: 2, // VoteValues.YES
      voteWeight: 700000n,
    },
    {
      address: "0x234567891234567891234567891234567890",
      vote: 3, // VoteValues.NO
      voteWeight: 300000n,
    }
  ]
  status: "Executed",
}
*/
```
### Loading the list of proposals (ERC20)

Retrieving the proposals of an ERC20 DAO.

```ts
import { ClientErc20, Context, ContextPlugin, SortDirection, IProposalQueryParams, ProposalSortBy, Erc20ProposalListItem } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an ERC20 client
const client = new ClientErc20(contextPlugin)

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.POPULARITY //optional
}

const proposals: Erc20ProposalListItem[] = await client.methods.getProposals(queryParams)
console.log(proposals)
/*
[
  {
    id: "0x12345...",
    dao: {
      address: "0x1234567890123456789012345678901234567890",
      name: "Cool DAO"
    };
    creatorAddress: "0x1234567890123456789012345678901234567890",
    metadata: {
      title: "Test Proposal",
      summary: "test proposal summary"
    };
    startDate: <Date>,
    endDate: <Date>,
    status: "Executed",
    token: {
      address: "0x1234567890123456789012345678901234567890,
      name: "The Token",
      symbol: "TOK",
      decimals: 18
    },
    results {
      yes: 100000n,
      no: 77777n,
      abstain: 0n
    }
  },
  {
    id: "0x12345...",
    dao: {
      address: "0x1234567890123456789012345678901234567890",
      name: "Cool DAO"
    };
    creatorAddress: "0x1234567890123456789012345678901234567890",
    metadata: {
      title: "Test Proposal 2",
      summary: "test proposal summary 2"
    };
    startDate: <Date>,
    endDate: <Date>,
    status: "Pending",
    token: {
      address: "0x1234567890123456789012345678901234567890,
      name: "The Token",
      symbol: "TOK",
      decimals: 18
    },
    results {
      yes: 100000n,
      no: 77777n,
      abstain: 0n
    }
  }
]
*/
```

## Address list governance plugin client

```ts
import { ClientAddressList, Context, ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// create addressList client
const client = new ClientAddressList(contextPlugin)
```

### Creating a DAO with a addressList plugin

```ts
import { Client, Context, DaoCreationSteps, ICreateParams, GasFeeEstimation, ClientAddressList, IAddressListPluginInstall } from "@aragon/sdk-client";
import { Wallet } from 'ethers'


const context: Context = new Context(params)
const client: Client = new Client(context)

// Define the plugins to install and their params

const pluginInitParams: IAddressListPluginInstall = {
  settings: {
    minDuration: 60 * 60 * 24, // seconds
    minTurnout: 0.25, // 25%
    minSupport: 0.5 // 50%
  },
  addresses: [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123"
  ]
};

const addressListInstallPluginItem = ClientAddressList.encoding.getPluginInstallItem(pluginInitParams)

const createParams: ICreateParams = {
  metadata: {
    name: "My DAO",
    description: "This is a description",
    avatar: "",
    links: [{
      name: "Web site",
      url: "https://..."
    }]
  },
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [addressListInstallPluginItem]
}

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.create(createParams)
console.log(estimatedGas.average)
console.log(estimatedGas.max)

const steps = client.methods.create(createParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log(step.txHash)
        break
      case DaoCreationSteps.DONE:
        console.log(step.address)
        break
    }
  } catch (err) {
    console.error(err)
  }
}
```

### Creating a address list proposal
```ts
import { ClientAddressList, Context, ContextPlugin, ICreateProposalParams, ProposalCreationSteps, VoteValues } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an address list client
const client = new ClientAddressList(contextPlugin)

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x123456789012345678901234567890123456789012",
  metadata: {
    title: "Test Proposal",
    summary: "This is a short description",
    description: "This is a long descrioption",
    resources: [
      {
        name: "Discord",
        url: "https://discord.com/..."
      },
      {
        name: "Website",
        url: "https://website..."
      }
    ],
    media: {
      logo: "https://...",
      header: "https://..."
    }
  },
  actions: [],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES
}

const steps = client.methods.createProposal(proposalParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash)
        break
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId)
        break
    }
  } catch (err) {
    console.error(err)
  }
}
```

### Creating a address list proposal with an action

```ts
import { ClientAddressList, Context, ContextPlugin, ICreateProposalParams, ProposalCreationSteps, VoteValues, IProposalSettings } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an address list client
const client = new ClientAddressList(contextPlugin)

// create config action
const configActionPrarms: IProposalSettings = {
  minDuration: 60 * 60 * 24,
  minSupport: 0.3, // 30%
  minTurnout: 0.5 // 50%
}

const configAction = client.encoding.updatePluginSettingsAction(configActionPrarms)

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x123456789012345678901234567890123456789012",
  metadata: {
    title: "Test Proposal",
    summary: "This is a short description",
    description: "This is a long descrioption",
    resources: [
      {
        name: "Discord",
        url: "https://discord.com/..."
      },
      {
        name: "Website",
        url: "https://website..."
      }
    ],
    media: {
      logo: "https://...",
      header: "https://..."
    }
  },
  actions: [configAction],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES
}

const steps = client.methods.createProposal(proposalParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash)
        break
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId)
        break
    }
  } catch (err) {
    console.error(err)
  }
}
```

### Voting on a address list proposal
```ts
import { ClientAddressList, Context, ContextPlugin, VoteProposalStep, VoteValues } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an address list client
const client = new ClientAddressList(contextPlugin)

const voteParams: IVoteProposalParams = {
  pluginAddress: "0x123456789012345678901234567890123456789012",
  proposalId: '0x1234567890123456789012345678901234567890',
  vote: VoteValues.YES
}

const steps = client.methods.voteProposal(voteParams)
for await (const step of steps) {
  try {
    switch (step.key) {
      case VoteProposalStep.VOTING:
        console.log(step.txHash)
        break
      case VoteProposalStep.DONE:
        console.log(step.voteId)
        break
    }
  } catch (err) {
    console.error(err)
  }
}
 ```

### Loading the list of members (address list plugin)
```ts
import { ClientAddressList, Context, ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an address list client
const client = new ClientAddressList(contextPlugin)

const daoAddressorEns = "0x12345..."

const members: string[] = await client.methods.getMembers(daoAddressorEns)
console.log(members)
/*
[
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
  "0x5678901234567890123456789012345678901234",
]
*/
```

### Loading the a proposal by proposalId (address list plugin)
```ts
import { ClientAddressList, Context, ContextPlugin, AddressListProposal } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an address list client
const client = new ClientAddressList(contextPlugin)

const proposalId = "0x12345..."

const proposal: AddressListProposal = await client.methods.getProposal(proposalId)
console.log(proposal)
/*
{
  id: "0x12345...",
  dao: {
    address: "0x1234567890123456789012345678901234567890",
    name: "Cool DAO"
  };
  creatorAddress: "0x1234567890123456789012345678901234567890",
  metadata: {
    title: "Test Proposal",
    summary: "test proposal summary",
    description: "this is a long description",
    resources: [
      {
        url: "https://dicord.com/...",
        name: "Discord"
      },
      {
        url: "https://docs.com/...",
        name: "Document"
      }
    ],
    media: {
      header: "https://.../image.jpeg",
      logo: "https://.../image.jpeg"
    }
  };
  startDate: <Date>,
  endDate: <Date>,
  creationDate: <Date>,
  actions: [
    {
      to: "0x12345..."
      value: 10n
      data: [12,13,154...]
    }
  ],
  status: "Executed",
  result {
    yes: 1,
    no: 1,
    abstain: 0
  }
  settings: {
    minTurnout: 0.5,
    minSupport: 0.25,
    minDuration: 7200
  },
  votes: [
    {
      address: "0x123456789123456789123456789123456789",
      vote: 2, // VoteValues.YES
    },
    {
      address: "0x234567891234567891234567891234567890",
      vote: 3, // VoteValues.NO
    }
  ]
}
*/
```
### Loading the list of proposals (address list plugin)
```ts
import { ClientAddressList, Context, ContextPlugin, SortDirection, AddressListProposalListItem, ProposalSortBy, IProposalQueryParams } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

// Create a simple context
const context: Context = new Context(params)
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
// Create an address list client
const client = new ClientAddressList(contextPlugin)

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.POPULARITY //optional
}

const proposals: AddressListProposalListItem[] = await client.methods.getProposals(queryParams)
console.log(proposals)
/*
[
  {
    id: "0x12345...",
    dao: {
      address: "0x1234567890123456789012345678901234567890",
      name: "Cool DAO"
    };
    creatorAddress: "0x1234567890123456789012345678901234567890",
    metadata: {
      title: "Test Proposal",
      summary: "test proposal summary"
    };
    startDate: <Date>,
    endDate: <Date>,
    status: "Executed",
    results {
      yes: 100000n,
      no: 77777n,
      abstain: 0n
    }
  },
  {
    id: "0x12345...",
    dao: {
      address: "0x1234567890123456789012345678901234567890",
      name: "Cool DAO"
    };
    creatorAddress: "0x1234567890123456789012345678901234567890",
    metadata: {
      title: "Test Proposal 2",
      summary: "test proposal summary 2"
    };
    startDate: <Date>,
    endDate: <Date>,
    status: "Pending",
    results {
      yes: 100000n,
      no: 77777n,
      abstain: 0n
    }
  }
]
*/
```

## Action encoders

Proposals will eventually need to execute some action on behalf of the DAO,
which needs to be encoded in a low level format.

The helpers above help encoding the most typical DAO operations.

### Withdrawals

```ts
import { Client, Context, IWithdrawParams } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

const context: Context = new Context(params)
const client: Client = new Client(context)

const withdrawParams: IWithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test",
}
const daoAddress = "0x1234567890123456789012345678901234567890"

const withdrawAction = await client.encoding.withdrawAction(daoAddress, withdrawParams)
console.log(withdrawAction)
```

### Set Plugin Config (Address List)

```ts
import { ClientAddressList, Context, ContextPlugin, ICreateProposalParams, ProposalCreationSteps, VoteValues, IProposalSettings } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

const context: Context = new Context(params)
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
const client = new ClientAddressList(contextPlugin)

// create config action
const configActionPrarms: IProposalSettings = {
  minDuration: 60 * 60 * 24,
  minSupport: 0.3, // 30%
  minTurnout: 0.5 // 50%
}
const configAction = client.encoding.updatePluginSettingsAction(configActionPrarms)

```
### Set Plugin Config (ERC-20)

```ts
import { ClientErc20, Context, ContextPlugin, ICreateProposalParams, ProposalCreationSteps, VoteValues, IProposalSettings } from "@aragon/sdk-client";
import { Wallet } from 'ethers'

const context: Context = new Context(params)
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context)
const client = new ClientErc20(contextPlugin)

// create config action
const configActionPrarms: IProposalSettings = {
  minDuration: 60 * 60 * 24,
  minSupport: 0.3, // 30%
  minTurnout: 0.5 // 50%
}
const configAction = client.encoding.updatePluginSettingsAction(configActionPrarms)

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
