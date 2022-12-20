## Context

The [Context](../../context.ts) class is an utility component that holds the
configuration passed to any [Client](../../client.ts) instance.

```ts
import { Context } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { ContextParams } from "@aragon/sdk-client";


export const IPFS_API_KEY = "ipfs-api-key";

export const contextParams: ContextParams = {
  network: "mainnet",
  signer: new Wallet("privateKey"),
  // Optional on "rinkeby", "arbitrum-rinkeby" or "mumbai"
  daoFactoryAddress: "0x1234...",
  web3Providers: ["https://cloudflare-eth.com/"],
  ipfsNodes: [
    {
      url: "https://testing-ipfs-0.aragon.network/api/v0",
      headers: { "X-API-KEY": IPFS_API_KEY || "" },
    },
  ],
  graphqlNodes: [
    {
      url:
        "https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby",
    },
  ],
};

// Instantiate
const context = new Context(contextParams);

// Update
context.set({ network: 1 });
context.set({ signer: new Wallet("other private key") });
context.setFull(contextParams);
```

## General purpose client

The [Client](./src/client.ts) class allows to perform operations that apply to
all DAO's, regardless of the plugins they use.

```ts
import { Client, Context } from "@aragon/sdk-client";
import { contextParams } from "./00-context";
// Can be stored in a singleton and inherited from there
const context: Context = new Context(contextParams);

const client = new Client(context);

console.log(client);
```

### Creating a DAO

```ts
import {
  Client,
  Context,
  DaoCreationSteps,
  DaoMetadata,
  GasFeeEstimation,
  CreateDaoParams
} from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const metadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
};
const ipfsUri = await client.methods.pinMetadata(metadata);
const createParams: CreateDaoParams = {
  metadataUri: ipfsUri,
  ensSubdomain: "my-org", // my-org.dao.eth,
  plugins: [],
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(
  createParams,
);
console.log(estimatedGas.average);
console.log(estimatedGas.max);

const steps = client.methods.createDao(createParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case DaoCreationSteps.DONE:
        console.log(step.address);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Depositing ETH to a DAO

Handles the flow of depositing the native EVM token to an Aragon DAO.

```ts
import {
  Client,
  Context,
  DaoDepositSteps,
  GasFeeEstimation,
  IDepositParams,
} from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const depositParams: IDepositParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount in wei
  reference: "test deposit", // optional
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(
  depositParams,
);
console.log(estimatedGas.average);
console.log(estimatedGas.max);

const steps = client.methods.deposit(depositParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoDepositSteps.DEPOSITING:
        console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
        break;
      case DaoDepositSteps.DONE:
        console.log(step.amount); // 10n
        break;
    }
  } catch (err) {
    console.error(err);
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
import {
  Client,
  Context,
  DaoDepositSteps,
  GasFeeEstimation,
  IDepositParams,
} from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context = new Context(contextParams);
const client = new Client(context);
const depositParams: IDepositParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
  reference: "test deposit", // optional
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(
  depositParams,
);
console.log(estimatedGas.average);
console.log(estimatedGas.max);

const steps = client.methods.deposit(depositParams);
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
    console.error(err);
  }
}
```

### Loading Multiple DAOs

Handles retrieving list of DAO metadata.

```ts
import {
  Client,
  Context,
  DaoListItem,
  DaoSortBy,
  IDaoQueryParams,
  SortDirection,
} from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const queryParams: IDaoQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: DaoSortBy.POPULARITY, //optional
};
const daos: DaoListItem[] = await client.methods.getDaos(queryParams);
console.log(daos);

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
        id: "token-voting.plugin.dao.eth",
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
        id: "token-voting.plugin.dao.eth",
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
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const daoAddressOrEns = "0x1234567890123456789012345678901234567890"; // test.dao.eth
const dao: DaoDetails | null = await client.methods.getDao(daoAddressOrEns);
console.log(dao);

/*
{
  address: "0x1234567890123456789012345678901234567890",
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
      id: token-voting.plugin.dao.eth,
      instanceAddress: "0x12345..."
    }
  ]
}
*/
```

### Loading DAO activity

Retrieves the list of asset transfers to and from the given DAO (by default,
from ETH, DAI, USDC and USDT, on Mainnet)

```ts
import {
  Client,
  Context,
  ITransferQueryParams,
  Transfer,
  TransferSortBy,
  TransferType,
} from "@aragon/sdk-client";
import { SortDirection } from "../../src";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const params: ITransferQueryParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // optional
  sortBy: TransferSortBy.CREATED_AT, // optional
  limit: 10, // optional
  skip: 0, // optional
  direction: SortDirection.ASC, // optional
  type: TransferType.DEPOSIT, // optional
};
const transfers: Transfer[] | null = await client.methods.getDaoTransfers(params);
console.log(transfers);

/*
[
  {
    type: "withdraw",
    tokenType: "erc20",
    token: {
      address: "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735",
      name: "Dai Stablecoin",
      symbol: "DAI",
      decimals: 18,
    },
    amount: 1000000000000000n,
    creationDate: <Date>
    reference: "withdrawing from dao to:0xc8541aAE19C5069482239735AD64FAC3dCc52Ca2",
    transactionId: "0xdb0f9422b5c3199021481c98a655741ca16119ff8a59571854a94a6f31dad7ba",
    to: "0xc8541aae19c5069482239735ad64fac3dcc52ca2",
    proposalId: 0n
  },
  {
    type: "deposit",
    tokenType: "native",
    amount: 1000000000000000n,
    creationDate: <Date>
    reference: "dummy deposit of ETH, amount:0.001",
    transactionId: "0xc18b310b2f8cf427d95fa905dc842df2cf999075f18579afbcbdce19f8db0a30",
    from: "0xc8541aae19c5069482239735ad64fac3dcc52ca2",
  },
  {
    type: "deposit",
    tokenType: "erc20",
    token: {
      address: "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735",
      name: "Dai Stablecoin",
      symbol: "DAI",
      decimals: 18,
    },
    amount: 1000000000000000n,
    creationDate: <Date>
    reference: "dummy deposit of Dai, amount:0.001",
    transactionId: "0xdd8fff77c1f3e819d4224f8d02a00583c7e5d55475b8a9d70867aee0d6d16f07",
    from: "0xc8541aae19c5069482239735ad64fac3dcc52ca2",
  }
]
*/
```

### Loading DAO financial data

Handles retrieving DAO asset balances using the DAO address or its ENS domain.

```ts
import { AssetBalance, Client, Context } from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const daoAddressOrEns = "0x12345...";
const balances: AssetBalance[] | null = await client.methods.getDaoBalances(daoAddressOrEns);
console.log(balances);
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

### Ensure an a minimum token allowance
Check if the allowance is enough and updates it if it is not

```ts
import {
  Client,
  Context,
  DaoDepositSteps,
  EnsureAllowanceParams,
} from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context = new Context(contextParams);
const client = new Client(context);
const ensureAllowanceParams: EnsureAllowanceParams = {
  daoAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
};

const steps = client.methods.ensureAllowance(ensureAllowanceParams);
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
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Add and pin metadata
Adds an pin data with a the format used by aragon app into one of the specified IPFS nodes and return a ipfs cid preceded by ipfs://

```ts
import { Client, Context, IMetadata } from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context = new Context(contextParams);
const client = new Client(context);
const metadata: IMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
};
const metadataUri = await client.methods.pinMetadata(metadata);
console.log(metadataUri);

/*
  ipfs://Qm...
*/
```

## TokenVoting plugin client

This is a `Client`-like class, tailored to suit the specific use cases of the
built-in Token voting DAO Plugin.

Similarly to the above class, it provides high level methods that abstract the
underlying network requests.

### Creating a DAO with a TokenVoting plugin

```ts
import {
  Client,
  Context,
  DaoCreationSteps,
  GasFeeEstimation,
  CreateDaoParams,
  ITokenVotingPluginInstall,
  TokenVotingClient,
  VotingMode,
  DaoMetadata,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

// Define the plugins to install and their params

// Use an already existing ERC20 token
const pluginInitParams1: ITokenVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.STANDARD, // default standard
  },
  useToken: {
    address: "0x...",
  },
};
// Mint a new token
const pluginInitParams2: ITokenVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.EARLY_EXECUTION, // default standard
  },
  newToken: {
    name: "Token",
    symbol: "TOK",
    decimals: 18,
    minter: "0x...", // optionally, define a minter
    balances: [
      { // Initial balances of the new token
        address: "0x...",
        balance: BigInt(10),
      },
      {
        address: "0x...",
        balance: BigInt(10),
      },
      {
        address: "0x...",
        balance: BigInt(10),
      },
    ],
  },
};
const tokenVotingInstallPluginItem1 = TokenVotingClient.encoding
  .getPluginInstallItem(
    pluginInitParams1,
  );
const tokenVotingInstallPluginItem2 = TokenVotingClient.encoding
  .getPluginInstallItem(
    pluginInitParams2,
  );

const daoMetadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
};

const metadataUri = await client.methods.pinMetadata(daoMetadata);

const createParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [tokenVotingInstallPluginItem1, tokenVotingInstallPluginItem2],
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(
  createParams,
);
console.log(estimatedGas.average);
console.log(estimatedGas.max);

const steps = client.methods.createDao(createParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case DaoCreationSteps.DONE:
        console.log(step.address);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Create a TokenVoting context

```ts
import { Context, ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// update
contextPlugin.set({ network: 1 });
contextPlugin.set({ signer: new Wallet("other private key") });
contextPlugin.setFull(contextParams);

console.log(contextPlugin)
```

### Create a TokenVoting client

```ts
import { Context, ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

const client = new TokenVotingClient(contextPlugin);

console.log(client);
```

### Creating a TokenVoting proposal

```ts
import {
  Context,
  ContextPlugin,
  ICreateProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  TokenVotingClient,
  VoteValues,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const client = new TokenVotingClient(contextPlugin);

const metadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/...",
    },
    {
      name: "Website",
      url: "https://website...",
    },
  ],
  media: {
    logo: "https://...",
    header: "https://...",
  },
};

const ipfsUri = await client.methods.pinMetadata(metadata);

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri: ipfsUri,
  actions: [],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES,
};

const steps = client.methods.createProposal(proposalParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Creating a TokenVoting proposal with an action

```ts
import {
  Context,
  ContextPlugin,
  ICreateProposalParams,
  ProposalCreationSteps,
  TokenVotingClient,
  VoteValues,
  VotingMode,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const client = new TokenVotingClient(contextPlugin);

// create config action
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.EARLY_EXECUTION, // default standard
};

const pluginAddress = "0x1234567890123456789012345678901234567890";

const configAction = client.encoding.updatePluginSettingsAction(
  pluginAddress,
  configActionPrarms,
);

const metadataUri = await client.methods.pinMetadata({
  title: "Test proposal",
    summary: "This is a test proposal",
    description: "his is a test proposal, but longer",
    resources: [
      {
        url: "https://thforumurl.com",
        name: "Forum"
      }
    ],
    media: {
      header: "https://fileserver.com/header.png",
      logo: "https://fileserver.com/logo.png"
    }
})

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri,
  actions: [configAction],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES,
};

const steps = client.methods.createProposal(proposalParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Voting on a TokenVoting proposal

```ts
import {
  Context,
  ContextPlugin,
  IVoteProposalParams,
  TokenVotingClient,
  VoteProposalStep,
  VoteValues,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const client = new TokenVotingClient(contextPlugin);

const voteParams: IVoteProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(0),
  vote: VoteValues.YES,
};

const steps = client.methods.voteProposal(voteParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case VoteProposalStep.VOTING:
        console.log(step.txHash);
        break;
      case VoteProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Checking if user can vote in a TokenVoting proposal

```ts
import {
  Context,
  ContextPlugin,
  ICanVoteParams,
  TokenVotingClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new TokenVotingClient(contextPlugin);

const voteParams: ICanVoteParams = {
  addressOrEns: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(1),
  pluginAddress: "0x1234567890123456789012345678901234567890",
};

const canVote = await client.methods.canVote(voteParams);
console.log(canVote);
/*
true
*/
```

### Loading the list of members (TokenVoting)

Retrieving all the members of a TokenVoting DAO.

```ts
import { Context, ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const client = new TokenVotingClient(contextPlugin);

const daoAddressorEns = "0x12345...";

const members: string[] = await client.methods.getMembers(daoAddressorEns);
console.log(members);
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

### Retrieve a proposal by proposalID (TokenVoting)

Retrieving the proposals of a TokenVoting DAO.

```ts
import {
  Context,
  ContextPlugin,
  TokenVotingClient,
  TokenVotingProposal,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const client = new TokenVotingClient(contextPlugin);

const proposalId = "0x12345...";

const proposal: TokenVotingProposal | null = await client.methods.getProposal(
  proposalId,
);
console.log(proposal);
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
  creationBlockNumber: 812345,
  executionDate: <Date>,
  executionBlockNumber: 812345,
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
    decimals: 18,
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

### Loading the list of proposals (TokenVoting)

Retrieving the proposals of a TokenVoting DAO.

```ts
import {
  Context,
  ContextPlugin,
  IProposalQueryParams,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
  TokenVotingClient,
  TokenVotingProposalListItem,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const client = new TokenVotingClient(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.POPULARITY, // optional
  status: ProposalStatus.ACTIVE, // optional
};

const proposals: TokenVotingProposalListItem[] = await client.methods
  .getProposals(
    queryParams,
  );
console.log(proposals);
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

### Loading a plugin's settings

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an addres list client
const client = new AddresslistVotingClient(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const settings: VotingSettings | null = await client.methods.getVotingSettings(
  pluginAddress,
);
console.log(settings);
/*
  {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: "Standard",
  }
*/
```

### Loading a plugin's token details

```ts
import {
  Context,
  ContextPlugin,
  Erc20TokenDetails,
  TokenVotingClient,
} from "@aragon/sdk-client";
import { Erc721TokenDetails } from "../../src/tokenVoting/interfaces";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const client = new TokenVotingClient(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const token: Erc20TokenDetails | Erc721TokenDetails | null = await client
  .methods.getToken(
    pluginAddress,
  );
console.log(token);
/*
  {
    address: "0x123456789000987654323112345678900987654321",
    name: "Token",
    symbol: "TOK",
    decimals: 18
  }
  or
  {
    address: "0x123456789000987654323112345678900987654321",
    name: "Token",
    symbol: "TOK",
    baseUri: "base.uri"
  }
*/
```

### Add and pin metadata
Adds an pin data with a the format used by aragon app into one of the specified IPFS nodes and return a ipfs cid preceded by ipfs://

```ts
import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  ProposalMetadata,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin = ContextPlugin.fromContext(context);
const client = new TokenVotingClient(contextPlugin);
const metadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/...",
    },
    {
      name: "Website",
      url: "https://website...",
    },
  ],
  media: {
    logo: "https://...",
    header: "https://...",
  },
};
const metadataUri = await client.methods.pinMetadata(metadata);
console.log(metadataUri);

/*
  ipfs://Qm...
*/
```

## Address List governance plugin client
### Creating a DAO with a addresslistVoting plugin

```ts
import {
  Client,
  AddresslistVotingClient,
  Context,
  DaoCreationSteps,
  GasFeeEstimation,
  CreateDaoParams,
  DaoMetadata,
  VotingMode,
  IAddressListPluginInstall,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

// Define the plugins to install and their params

const pluginInitParams: IAddressListPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.VOTE_REPLACEMENT,
  },
  addresses: [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123",
  ],
};

const addresslistVotingInstallPluginItem = AddresslistVotingClient.encoding
  .getPluginInstallItem(pluginInitParams);

const daoMetadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
};

const metadataUri = await client.methods.pinMetadata(daoMetadata);

const createParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [addresslistVotingInstallPluginItem],
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(
  createParams,
);
console.log(estimatedGas.average);
console.log(estimatedGas.max);

const steps = client.methods.createDao(createParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case DaoCreationSteps.DONE:
        console.log(step.address);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Create an Address List context

```ts
import { Context, ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// update
contextPlugin.set({ network: 1 });
contextPlugin.set({ signer: new Wallet("other private key") });
contextPlugin.setFull(contextParams);

console.log(contextPlugin)
```

### Create an Address List client

```ts
import { AddresslistVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

const client = new AddresslistVotingClient(contextPlugin);

console.log(client);
```

### Creating a address list proposal

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  ICreateProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  VoteValues,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new AddresslistVotingClient(contextPlugin);

const metadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/...",
    },
    {
      name: "Website",
      url: "https://website...",
    },
  ],
  media: {
    logo: "https://...",
    header: "https://...",
  },
};

const ipfsUri = await client.methods.pinMetadata(metadata);

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri: ipfsUri,
  actions: [],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES,
};

const steps = client.methods.createProposal(proposalParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Creating a address list proposal with an action

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  ICreateProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  VoteValues,
  VotingMode,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new AddresslistVotingClient(contextPlugin);

// create config action
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.EARLY_EXECUTION,
};

const pluginAddress = "0x1234567890123456789012345678901234567890";

const configAction = client.encoding.updatePluginSettingsAction(
  pluginAddress,
  configActionPrarms,
);

const daoMetadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long descrioption",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/...",
    },
    {
      name: "Website",
      url: "https://website...",
    },
  ],
  media: {
    logo: "https://...",
    header: "https://...",
  },
};

const metadataUri = await client.methods.pinMetadata(daoMetadata);

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri,
  actions: [configAction],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES,
};

const steps = client.methods.createProposal(proposalParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Voting on a address list proposal

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  IVoteProposalParams,
  VoteProposalStep,
  VoteValues,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new AddresslistVotingClient(contextPlugin);

const voteParams: IVoteProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(0),
  vote: VoteValues.YES,
};

const steps = client.methods.voteProposal(voteParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case VoteProposalStep.VOTING:
        console.log(step.txHash);
        break;
      case VoteProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Checking if user can vote in a address list proposal

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  ICanVoteParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new AddresslistVotingClient(contextPlugin);

const voteParams: ICanVoteParams = {
  addressOrEns: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(1),
  pluginAddress: "0x1234567890123456789012345678901234567890",
};

const canVote = await client.methods.canVote(voteParams);
console.log(canVote);
/*
true
*/
```

### Loading the list of members (address list plugin)

```ts
import { AddresslistVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddressList client
const client = new AddresslistVotingClient(contextPlugin);

const daoAddressorEns = "0x12345...";

const memebers: string[] = await client.methods.getMembers(daoAddressorEns);
console.log(memebers);
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
import {
  AddresslistVotingProposal,
  AddresslistVotingClient,
  Context,
  ContextPlugin,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddressList client
const client = new AddresslistVotingClient(contextPlugin);

const proposalId = "0x12345...";

const proposal: AddresslistVotingProposal | null = await client.methods.getProposal(
  proposalId,
);
console.log(proposal);
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
  creationBlockNumber: 812345,
  executionDate: <Date>,
  executionBlockNumber: 812345,
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
import {
  AddresslistVotingProposalListItem,
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  IProposalQueryParams,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new AddresslistVotingClient(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.POPULARITY, //optional
  status: ProposalStatus.ACTIVE, // optional
};

const proposals: AddresslistVotingProposalListItem[] = await client.methods
  .getProposals(queryParams);
console.log(proposals);
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

### Loading a plugin's settings

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddressList client
const client = new AddresslistVotingClient(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const settings: VotingSettings | null = await client.methods.getVotingSettings(
  pluginAddress,
);
console.log(settings);
/*
  {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: "Standard",
  }
*/
```

### Add and pin metadata
Adds an pin data with a the format used by aragon app into one of the specified IPFS nodes and return a ipfs cid preceded by ipfs://

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  ProposalMetadata,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin = ContextPlugin.fromContext(context);
const client = new AddresslistVotingClient(contextPlugin);
const metadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/...",
    },
    {
      name: "Website",
      url: "https://website...",
    },
  ],
  media: {
    logo: "https://...",
    header: "https://...",
  },
};
const metadataUri = await client.methods.pinMetadata(metadata);
console.log(metadataUri);

/*
  ipfs://Qm...
*/
```

## Action encoders

Proposals will eventually need to execute some action on behalf of the DAO,
which needs to be encoded in a low level format.

The helpers above help encoding the most typical DAO operations.
### Grant permission

```ts
import {
  Client,
  Context,
  IGrantPermissionParams,
  Permissions,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const grantParams: IGrantPermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION,
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const grantAction = await client.encoding.grantAction(
  daoAddress,
  grantParams,
);
console.log(grantAction);
/*
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
```

### Revoke permission

```ts
import {
  Client,
  Context,
  IRevokePermissionParams,
  Permissions,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const revokeParams: IRevokePermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION,
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const revokeAction = await client.encoding.revokeAction(
  daoAddress,
  revokeParams,
);
console.log(revokeAction);
/*
{
  to: "0x1234567890...",
  value: 0n;
  data: Uint8Array[12,34,45...]
}
*/
```

### Freeze permission

```ts
import {
  Client,
  Context,
  IFreezePermissionParams,
  Permissions,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const freezeParams: IFreezePermissionParams = {
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION,
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const freezeAction = await client.encoding.freezeAction(
  daoAddress,
  freezeParams,
);
console.log(freezeAction);
/*
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
```

### Withdrawals

```ts
import { Client, Context, IWithdrawParams } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const withdrawParams: IWithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test",
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const withdrawAction = await client.encoding.withdrawAction(
  daoAddress,
  withdrawParams,
);
console.log(withdrawAction);
```

### Update Metadata

```ts
import { Client, Context, DaoMetadata } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const metadataParams: DaoMetadata = {
  name: "New Name",
  description: "New description",
  avatar: "https://theavatar.com/image.jpg",
  links: [
    {
      url: "https://discord.com/...",
      name: "Discord",
    },
    {
      url: "https://twitter.com/...",
      name: "Twitter",
    },
  ],
};
const daoAddressOrEns = "0x12345";

const ipfsUri = await client.methods.pinMetadata(metadataParams);

const updateDaoMetadataAction = await client.encoding.updateDaoMetadataAction(
  daoAddressOrEns,
  ipfsUri,
);
console.log(updateDaoMetadataAction);
```

### Set Plugin Config (Address List)

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  VotingMode,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new AddresslistVotingClient(contextPlugin);

// create config action
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD,
};

const pluginAddress = "0x1234567890123456789012345678901234567890";

const configAction = client.encoding.updatePluginSettingsAction(
  pluginAddress,
  configActionPrarms,
);
console.log(configAction);
```

### Set Plugin Config (TokenVoting)

```ts
import {
  Context,
  ContextPlugin,
  TokenVotingClient,
  VotingMode,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new TokenVotingClient(contextPlugin);

// create config action
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD, // default standard
};

const pluginAddress = "0x1234567890123456789012345678901234567890";

const configAction = client.encoding.updatePluginSettingsAction(
  pluginAddress,
  configActionPrarms,
);
console.log(configAction);
```

### Mint Token (TokenVoting)

```ts
import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  IMintTokenParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new TokenVotingClient(contextPlugin);

const params: IMintTokenParams = {
  addressOrEns : "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
};

const minterAddress = "0x0987654321098765432109876543210987654321";
const action = client.encoding.mintTokenAction(minterAddress, params);
console.log(action);
/*
{
  to: "0x0987654321098765432...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
```

### Add Members (AddressList)

```ts
import { AddresslistVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new AddresslistVotingClient(contextPlugin);

const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321",
];

const pluginAddress = "0x0987654321098765432109876543210987654321";
const action = client.encoding.addMembersAction(pluginAddress, members);
console.log(action);
/*
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
```

### Remove Members (AddressList)

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new AddresslistVotingClient(contextPlugin);

const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321",
];

const pluginAddress = "0x0987654321098765432109876543210987654321";
const action = client.encoding.removeMembersAction(pluginAddress, members);
console.log(action);
/*
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
```

### Add Members (Multisig)

```ts
import {
  Context,
  ContextPlugin,
  MultisigClient,
  AddAddressesParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new MultisigClient(contextPlugin);

const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321",
];

const addAddressesParams: AddAddressesParams = {
  members,
  pluginAddress: "0x0987654321098765432109876543210987654321",
};

const action = client.encoding.addAddressesAction(addAddressesParams);
console.log(action);
/*
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
```

### Remove Members (Multisig)

```ts
import {
  Context,
  ContextPlugin,
  MultisigClient,
  UpdateAddressesParams,
} from "@aragon/sdk-client";
import { RemoveAddressesParams } from "../../src";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new MultisigClient(contextPlugin);

const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321",
];

const removeAddressesParams: RemoveAddressesParams = {
  members,
  pluginAddress: "0x0987654321098765432109876543210987654321",
};

const action = client.encoding.removeAddressesAction(removeAddressesParams);
console.log(action);
/*
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
```

### Remove Members (Multisig)

```ts
import {
  Context,
  ContextPlugin,
  MultisigClient,
  UpdateMultisigVotingSettingsParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new MultisigClient(contextPlugin);

const updateMinApprovals: UpdateMultisigVotingSettingsParams = {
  votingSettings: {
    minApprovals: 2,
    onlyListed: false,
  },
  pluginAddress: "0x0987654321098765432109876543210987654321",
};
const action = client.encoding.updateMultisigVotingSettings(updateMinApprovals);
console.log(action);
/*
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
```

## Action decoders
### Decode action grant permission

```ts
import {
  Client,
  Context,
  IGrantPermissionDecodedParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

const grantParams: IGrantPermissionDecodedParams = client.decoding.grantAction(
  data,
);
console.log(grantParams);
/*
{
  who: "0x1234567890...",
  where: "0x1234567890...",
  permission: "UPGRADE_PERMISSION",
  permissionId: "0x12345..."
}
*/
```

### Decode action revoke permission

```ts
import {
  Client,
  Context,
  IRevokePermissionDecodedParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

const revokeParams: IRevokePermissionDecodedParams = client.decoding
  .revokeAction(data);
console.log(revokeParams);
/*
{
  who: "0x1234567890...",
  where: "0x1234567890...",
  permission: "UPGRADE_PERMISSION",
  permissionId: "0x12345..."
}
*/
```

### Decode action freeze permission

```ts
import {
  Client,
  Context,
  IFreezePermissionDecodedParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

const freezeParams: IFreezePermissionDecodedParams = client.decoding
  .freezeAction(data);
console.log(freezeParams);
/*
{
  where: "0x1234567890...",
  permission: "UPGRADE_PERMISSION",
  permissionId: "0x12345..."
}
*/
```

### Decode Withdraw Action

```ts
import { Client, Context, IWithdrawParams } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: IWithdrawParams = client.decoding.withdrawAction(data);

console.log(params);
/*
{
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: 10n,
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test",
}
*/
```

### Decode Update Metadata Action

Decode an update metadata action and expect the metadata

```ts
import { Client, Context, DaoMetadata } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const data: Uint8Array = new Uint8Array([12, 56]);

<<<<<<< HEAD
const params: DaoMetadata = await client.decoding.updateDaoMetadataAction(data);
=======
const params: DaoMetadata = await client.decoding.updateMetadataAction(data);
>>>>>>> b4fa3c6 (update dao metadata naming)

console.log(params);
/*
{
  "name":"New Name",
  "description":"New description",
  "avatar":"https://theavatar.com/image.jpg",
  "links":[
    {
      "url":"https://discord.com/...",
      "name":"Discord"
    },
    {
      "url":"https://twitter.com/...",
      "name":"Twitter"
    }
  ]
}
*/
```

### Decode Update Metadata Raw Action

Decode an update metadata action and expect an IPFS uri containing the cid

```ts
import { Client, Context } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: string = client.decoding.updateDaoMetadataRawAction(data);

console.log(params);
/*
ipfs://Qm...
*/
```

### Decode Update Plugin Settings Action (Address List)

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientAddressList = new AddresslistVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: VotingSettings = clientAddressList.decoding
  .updatePluginSettingsAction(data);

console.log(params);
/*
{
  minDuration: 7200, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("1")
}
*/
```

### Decode Update Plugin Settings Action (TokenVoting)

```ts
import {
  Context,
  ContextPlugin,
  TokenVotingClient,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const tokenVotingClient = new TokenVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: VotingSettings = tokenVotingClient.decoding
  .updatePluginSettingsAction(data);

console.log(params);
/*
{
  minDuration: 7200, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000")
}
*/
```

### Get Function Parameters from an encoded action

```ts
import { Client, Context } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

const functionParams = client.decoding.findInterface(data);

console.log(functionParams);

/*
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
*/
```

### Get Function Parameters from an encoded action (Address List)

```ts
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const functionParams = client.decoding.findInterface(data);

console.log(functionParams);

/*
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
*/
```

### Get Function Parameters from an encoded action (TokenVoting)

```ts
import { TokenVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const functionParams = client.decoding.findInterface(data);

console.log(functionParams);

/*
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
*/
```

### Decode Mint Token Action (TokenVoting)

```ts
import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  IMintTokenParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const tokenVotingClient = new TokenVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: IMintTokenParams = tokenVotingClient.decoding.mintTokenAction(data);

console.log(params);
/*
{
  address: "0x12345...",
  amount: 10n
}
*/
```

### Decode Add Members Action (Address List)

```ts
import { AddresslistVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientAddressList = new AddresslistVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const members: string[] = clientAddressList.decoding.addMembersAction(data);

console.log(members);
/*
[
  "0x12345...",
  "0x56789...",
  "0x13579...",
]
*/
```

### Decode Remove Members Action (Address List)

```ts
import { AddresslistVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientAddressList = new AddresslistVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const members: string[] = clientAddressList.decoding.removeMembersAction(data);

console.log(members);
/*
[
  "0x12345...",
  "0x56789...",
  "0x13579...",
]
*/
```

### Decode Add Members Action (Multisig)

```ts
import { Context, ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { MultisigPluginSettings } from "../../src";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const multisigClient = new MultisigClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const settings: string[] = multisigClient.decoding
  .addAddressesAction(
    data,
  );

console.log(settings);
/*
  [
    "0x12345...",
    "0x56789...",
    "0x13579...",
  ]
*/
```

### Decode Remove Members Action (Multisig)

```ts
import {
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigPluginSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const multisigClient = new MultisigClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const settings: MultisigPluginSettings = multisigClient.decoding
  .removeAddressesAction(data);

console.log(settings);
/*
{
  members: [
    "0x12345...",
    "0x56789...",
    "0x13579...",
  ],
  minApprovals: 2
}
*/
```

### Decode Remove Members Action (Multisig)

```ts
import { Context, ContextPlugin, MultisigClient, MultisigVotingSettings } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const multisigClient = new MultisigClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const minApprovals: MultisigVotingSettings = multisigClient.decoding
  .updateMultisigVotingSettings(data);

console.log(minApprovals);
/*
{
  minApprovals: 2,
  onlyListed: false
}
*/
```

## Multisig governance plugin client
### Creating a DAO with a multisig plugin

```ts
import {
  Client,
  Context,
  DaoCreationSteps,
  GasFeeEstimation,
  CreateDaoParams,
  MultisigPluginInstallParams,
} from "@aragon/sdk-client";
import { MultisigClient } from "../../src";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

// Define the plugins to install and their params

const members: string[] = [
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
];

const multisigIntallParams: MultisigPluginInstallParams = {
  votingSettings: {
    minApprovals: 1,
    onlyListed: true
  },
  members,
}

const multisigInstallPluginItem = MultisigClient.encoding
  .getPluginInstallItem(multisigIntallParams);

const metadataUri = await client.methods.pinMetadata({
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
});

const createParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [multisigInstallPluginItem],
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.create(
  createParams,
);
console.log(estimatedGas.average);
console.log(estimatedGas.max);

const steps = client.methods.create(createParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case DaoCreationSteps.DONE:
        console.log(step.address);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Create an Multisig context

```ts
import { Context, ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// update
contextPlugin.set({ network: 1 });
contextPlugin.set({ signer: new Wallet("other private key") });
contextPlugin.setFull(contextParams);

console.log(contextPlugin);
```

### Create an Multisig client

```ts
import { Context, ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

const client = new MultisigClient(contextPlugin);

console.log(client);
```

### Creating a multisig proposal

```ts
import {
  Client,
  Context,
  ContextPlugin,
  MultisigClient,
  ProposalCreationSteps,
  ProposalMetadata,
} from "@aragon/sdk-client";
import { CreateMultisigProposalParams, IWithdrawParams } from "../../src";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a multisig client
const client: Client = new Client(context);
// Create a multisig client
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const metadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/...",
    },
    {
      name: "Website",
      url: "https://website...",
    },
  ],
  media: {
    logo: "https://...",
    header: "https://...",
  },
};

const ipfsUri = await multisigClient.methods.pinMetadata(metadata);
const withdrawParams: IWithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test",
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const withdrawAction = await client.encoding.withdrawAction(
  daoAddress,
  withdrawParams,
);

const proposalParams: CreateMultisigProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri: ipfsUri,
  actions: [withdrawAction],
};

const steps = multisigClient.methods.createProposal(proposalParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Approve a multisig proposal

```ts
import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  Context,
  ContextPlugin,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const approveParams: ApproveMultisigProposalParams = {
  proposalId: BigInt(0),
  pluginAddress: "0x1234567890123456789012345678901234567890",
  tryExecution: true,
};

const steps = client.methods.approveProposal(approveParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ApproveProposalStep.APPROVING:
        console.log(step.txHash);
        break;
      case ApproveProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Approve a multisig proposal

```ts
import {
  Context,
  ContextPlugin,
  ExecuteProposalStep,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const steps = client.methods.executeProposal(
  {
    pluginAddress: "0x1234567890123456789012345678901234567890",
    proposalId: BigInt(0),
  },
);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ExecuteProposalStep.EXECUTING:
        console.log(step.txHash);
        break;
      case ExecuteProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Checking if user can approve in a multisig plugin

```ts
import {
  CanApproveParams,
  Context,
  ContextPlugin,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);
const canApproveParams: CanApproveParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  addressOrEns: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(0),
};

const canApprove = await client.methods.canApprove(canApproveParams);
console.log(canApprove);
/*
true
*/
```

### Checking if user can approve in a multisig plugin

```ts
import {
  CanExecuteParams,
  Context,
  ContextPlugin,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);
const canExecuteParams: CanExecuteParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(0),
};
const canExecute = await client.methods.canExecute(canExecuteParams);
console.log(canExecute);
/*
true
*/
```

### Loading the list of members (multisig plugin)

```ts
import {
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigVotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const daoAddressorEns = "0x12345...";

const settings: MultisigVotingSettings = await client.methods
  .getVotingSettings(daoAddressorEns);
console.log(settings);
/*
{
  votingSettings: {
    minApprovals: 4,
    onlyListed: true
  }
}
*/
```

### Loading the a proposal by proposalId (multisig plugin)

```ts
import {
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigProposal,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const proposalId = "0x12345...";

const proposal: MultisigProposal | null = await client.methods.getProposal(
  proposalId,
);
console.log(proposal);
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
  creationDate: <Date>,
  actions: [
    {
      to: "0x12345..."
      value: 10n
      data: [12,13,154...]
    }
  ],
  status: "Executed",
  approvals: [
    "0x123456789123456789123456789123456789",
    "0x234567891234567891234567891234567890",
  ]
}
*/
```

### Loading the list of proposals (multisig plugin)

```ts
import {
  Context,
  ContextPlugin,
  IProposalQueryParams,
  MultisigClient,
  MultisigProposalListItem,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.POPULARITY, //optional
  status: ProposalStatus.ACTIVE, // optional
  daoAddressOrEns: "0x1234...",
};

const proposals: MultisigProposalListItem[] = await client.methods
  .getProposals(queryParams);
console.log(proposals);
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
    status: "Executed",
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
    status: "Pending",
  }
]
*/
```

### Add and pin metadata
Adds an pin data with a the format used by aragon app into one of the specified IPFS nodes and return a ipfs cid preceded by ipfs://

```ts
import {
  Context,
  ContextPlugin,
  MultisigClient,
  ProposalMetadata,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin = ContextPlugin.fromContext(context);
const client = new MultisigClient(contextPlugin);
const metadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/...",
    },
    {
      name: "Website",
      url: "https://website...",
    },
  ],
  media: {
    logo: "https://...",
    header: "https://...",
  },
};
const metadataUri = await client.methods.pinMetadata(metadata);
console.log(metadataUri);

/*
  ipfs://Qm...
*/
```

### Loading the list of members (multisig plugin)

```ts
import {
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigVotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const daoAddressorEns = "0x12345...";

const settings: string[] = await client.methods
  .getMembers(daoAddressorEns);
console.log(settings);
/*
[
  "0x1234567890...",
  "0x2345678901...",
  "0x3456789012...",
]
*/
```
