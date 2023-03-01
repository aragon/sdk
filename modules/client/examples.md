# Getting Started with the Aragon OSx SDK

## Before you begin

The Aragon OSx SDK is Javascript agnostic, which means you can use it with any Javascript framework, including popular ones like React, Vite, or Vue.

However, keep in mind that because server-side rendering is not supported yet for some crypto packages, you will not be able to use a framework like NextJS. Only frameworks that run entirely on client-side are supported.

Also know that all documentation within this site is done with Typescript. You can read more about [Typescript here](https://www.typescriptlang.org/).

## Installing the SDK

First thing you want to do is install the Aragon OSx SDK package into your product. You can do this by using `npm` or `yarn`.

```bash
npm install @aragon/sdk-client
```
or
```bash
yarn add @aragon/sdk-client
```

## Setting up the context

Then, you'll want to set up the Aragon OSx SDK context within your application to have access to the SDK functions. You can do this at any point within your app.

However, so you're not setting it up multiple times, we recommend you set it up as a [context hook](https://www.freecodecamp.org/news/react-context-for-beginners/) within Javascript application if you're using a framework like React, Vue, or other, or within the entry file of your app.

```ts
import { Wallet } from "@ethersproject/wallet";
import { Context, ContextParams } from "@aragon/sdk-client";

// Set up your IPFS API key. You can get one either by running a local node or by using a service like Infura or Alechmy.
// Make sure to always keep these private in a file that is not committed to your public repository.
export const IPFS_API_KEY: string = "ipfs-api-key";

export const contextParams: ContextParams = {
  // Choose the network you want to use. You can use "goerli" or "mumbai" for testing, "mainnet" for Ethereum.
  network: "goerli",
  // Depending on how you're configuring your wallet, you may want to pass in a `signer` object here.
  signer: new Wallet("private-key"),
  // Optional on "rinkeby", "arbitrum-rinkeby" or "mumbai"
  // Pass the address of the  `DaoFactory` contract you want to use. You can find it here based on your chain of choice: https://github.com/aragon/core/blob/develop/active_contracts.
  daoFactoryAddress: "0x1234381072385710239847120734123847123",
  // Choose your Web3 provider: Cloudfare, Infura, Alchemy, etc.
  web3Providers: ["https://rpc.ankr.com/eth_goerli"],
  ipfsNodes: [
    {
      url: "https://testing-ipfs-0.aragon.network/api/v0",
      headers: { "X-API-KEY": IPFS_API_KEY || "" }
    },
  ],
  // Don't change this line. This is how we connect your app to the Aragon subgraph.
  graphqlNodes: [
    {
      url:
        "https://subgraph.satsuma-prod.com/aragon/core-goerli/api"
    }
  ]
};

// Instantiate the Aragon SDK context
export const context: Context = new Context(contextParams);
```
Update the context with new parameters if you wish to throughout your app.

Aragon OSx SDK is Javascript agnostic, which means you can use it with any Javascript framework, including popular ones like React, Vite, or Vue.

However, keep in mind that because server-side rendering is not supported yet for some crypto packages, you will not be able to use a framework like NextJS. Only frameworks that run entirely on client-side are supported.

Also know that all documentation within this site is done with Typescript. You can read more about [Typescript here](https://www.typescriptlang.org/).

## Setting up the client

Next thing you'll want to do is set up the general purpose client so you can call on the SDK functions. This client is used to interact with any DAO on the network you're connected to.

The [Client](./src/client.ts) class allows you to perform operations that apply to all DAOs, regardless of the plugins they use.

We also have clients for each plugin, which allow us to use the plugin-specific functions.

Clients can be stored in a singleton and inherited from there. Can also be stored in a [context hook](https://www.freecodecamp.org/news/react-context-for-beginners/) for easier use throughout your Javascript framework.

```ts
import { Client } from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);
console.log({ client });
```

## General purpose functions

These are the functions every DAO will have, no matter which plugin they have installed.

### Create a DAO

The `createDao` function allows you to create a DAO using the parameters you set for it.

```ts
import {
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  DaoMetadata,
  GasFeeEstimation,
  ITokenVotingPluginInstall,
  TokenVotingClient,
  VotingMode
} from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const metadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "image-url",
  links: [{
    name: "Web site",
    url: "https://..."
  }]
};

// Through pinning the metadata in IPFS, we can get the IPFS URI. You can read more about it here: https://docs.ipfs.tech/how-to/pin-files/
const metadataUri = await client.methods.pinMetadata(metadata);

// You need at least one plugin in order to create a DAO. In this example, we'll use the TokenVoting plugin, but feel free to install whichever one best suites your needs. You can find resources on how to do this in the plugin sections.
// These would be the plugin params if you need to mint a new token for the DAO to enable TokenVoting.
const pluginInitParams: ITokenVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.EARLY_EXECUTION // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
  },
  newToken: {
    name: "Token", // the name of your token
    symbol: "TOK", // the symbol for your token. shouldn't be more than 5 letters
    decimals: 18, // the number of decimals your token uses
    minter: "0x...", // optional. if you don't define any, we'll use the standard OZ ERC20 contract. Otherwise, you can define your own token minter contract address.
    balances: [
      { // Defines the initial balances of the new token
        address: "0x2371238740123847102983471022", // address of the account to receive the newly minted tokens
        balance: BigInt(10) // amount of tokens that address should receive
      }
    ]
  }
};

// Creates a TokenVoting plugin client with the parameteres defined above (with an existing token).
const tokenVotingPluginToInstall = TokenVotingClient.encoding.getPluginInstallItem(pluginInitParams);

const createDaoParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [tokenVotingPluginToInstall] // plugin array cannot be empty or the transaction will fail. you need at least one governance mechanism to create your DAO.
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(createDaoParams);
console.log({ avg: estimatedGas.average, maximum: estimatedGas.max });

// Create the DAO.
const steps = client.methods.createDao(createDaoParams);

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

### Deposit ETH to a DAO

Handles the flow of depositing the native EVM token (when in mainnet, it's ETH) to an Aragon OSx DAO.

```ts
import {
  Client,
  DaoDepositSteps,
  GasFeeEstimation,
  DepositParams,
  TokenType
} from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const depositParams: DepositParams = {
  daoAddressOrEns: 'my-dao.dao.eth',
  amount: BigInt(10), // amount in wei
  type: TokenType.NATIVE // "native" for ETH, otherwise "erc20" for ERC20 tokens
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(depositParams);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Deposit ETH to the DAO.
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

### Deposit ERC20 tokens to a DAO

Deposits ERC20 tokens to a DAO.

- Similar to the ETH deposit flow
- The `tokenAddress` field is required. This is the contract address of the ERC-20 token.
- Will attempt to increase the ERC20 allowance if not sufficient.
- More intermediate steps are yielded.

```ts
import {
  Client,
  DaoDepositSteps,
  GasFeeEstimation,
  DepositParams,
  TokenType
} from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const depositParams: DepositParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // my-dao.dao.eth
  amount: BigInt(10), // amount in wei
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
  type: TokenType.ERC20 // "erc20" for ERC20 token, otherwise "native" for ETH
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(depositParams);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Deposit the ERC20 tokens.
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

### Get DAO details

Gets a DAO's details using its address or ENS domain.

```ts
import { Client, DaoDetails } from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// Address or ENS of the DAO whose metadata you want to retrieve.
const daoAddressOrEns: string = "0x1234567890123456789012345678901234567890"; // test.dao.eth

// Get a DAO's details.
const dao: DaoDetails | null = await client.methods.getDao(daoAddressOrEns);
console.log({ dao });
```
Returns:

```
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
    ]
  },
  creationDate: <Date>,
  plugins: [
    {
      id: token-voting.plugin.dao.eth,
      instanceAddress: "0x12345..."
    }
  ]
}
```

### Get DAOs

Gets a list of DAOs from the Aragon OSx DAO registry.

```ts
import {
  Client,
  DaoListItem,
  DaoSortBy,
  IDaoQueryParams,
  SortDirection
} from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const queryParams: IDaoQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: DaoSortBy.CREATED_AT //optional, alternatively "SUBDOMAIN" (and "POPULARITY" coming soon)
};

// Get a list of DAOs from the Aragon DAO registry.
const daos: DaoListItem[] = await client.methods.getDaos(queryParams);
console.log({ daos });
```
Returns:

```
{ daos:
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
      ensDomain: "test-1.dao.eth",
      metadata: {
          name: "Test 1",
          description: "This is a description 1"
      };
      plugins: [
        {
          id: "address-list-voting.plugin.dao.eth",
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
}
  ```

### Get a DAO's balance

Gets a DAO's financial assets based on the DAO address or its ENS domain.

```ts
import { AssetBalance, Client } from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// Address of the DAO whose asset balances you want to retrieve.
const daoAddressOrEns: string = "0x12345...";

// Get a DAO's asset balances.
const daoBalances: AssetBalance[] | null = await client.methods.getDaoBalances({ daoAddressOrEns });
console.log({ daoBalances });
```
Returns:

```
{ daoBalances:
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
}
```

### Get transfers from DAO's activity

Gets the list of asset transfers to and from DAOs.
If passed a `daoAddressOrEns`, will only retrieve transfers for that DAO. Otherwise, it returns for all DAOs.

By default, retrieves ETH, DAI, USDC and USDT, on Mainnet).

```ts
import {
  Client,
  ITransferQueryParams,
  SortDirection,
  Transfer,
  TransferSortBy,
  TransferType
} from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const params: ITransferQueryParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // optional
  sortBy: TransferSortBy.CREATED_AT, // optional
  limit: 10, // optional
  skip: 0, // optional
  direction: SortDirection.ASC, // optional, options: DESC or ASC
  type: TransferType.DEPOSIT // optional, options: DEPOSIT or WITHDRAW
};

// Get a list of DAO transfers based on params set.
const daoTransfers: Transfer[] | null = await client.methods.getDaoTransfers(params);
console.log({ daoTransfers });
```
Returns:

```
{ daoTransfers:
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
      proposalId: "0x1234567890123456789012345678901234567890_0x0"
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
}
```

```ts
m dao to:0xc8541aAE19C5069482239735AD64FAC3dCc52Ca2",
      transactionId: "0xdb0f9422b5c3199021481c98a655741ca16119ff8a59571854a94a6f31dad7ba",
      to: "0xc8541aae19c5069482239735ad64fac3dcc52ca2",
      proposalId: "0x1234567890123456789012345678901234567890_0x0"
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
}
```

### Updates ERC20 tokens' allowance approval

In order for an address to deposit an ERC20 token into the DAO, the allowance approval for that token needs to be set at the amount the person wants to deposit.
This function ensures the allowance approval is set so that amount.
Refer to OpenZeppelin docs here on ERC20's token allowance methods: https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#IERC20-allowance-address-address-).

This function updates the allowance approval to the amount specified.

```ts
import {
  Client,
  DaoDepositSteps,
  UpdateAllowanceParams
} from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const updateAllowanceParams: UpdateAllowanceParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount
  tokenAddress: "0x1234567890123456789012345678901234567890" // token contract adddress
};

const steps = client.methods.updateAllowance(updateAllowanceParams);

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

### Pins metadata for a DAO within IPFS

Adds a pin data set into the specified IPFS nodes.
Return an IPFS CID preceded by "ipfs://".

```ts
import { Client, DaoMetadata } from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// The Metadata object containing the details of the DAO.
const metadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://..."
  }]
};

// Pin the metadata in IPFS.
const metadataUri = await client.methods.pinMetadata(metadata);
console.log({ metadataUri });
```
Returns:

```
  { metadataUri: "ipfs://Qm..." }
```

## Create a TokenVoting client

In order to interact with the `TokenVoting` plugin, you need to create a `TokenVotingClient`.
This is created using the `ContextPlugin` which grants us access to plugins within the SDK.

```ts
import { ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate the ContextPlugin from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient = new TokenVotingClient(contextPlugin);
console.log({ tokenVotingClient });
```

### Create a DAO with a TokenVoting plugin installed

Creates a DAO with the TokenVoting plugin installed off the bat.

```ts
import {
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  DaoMetadata,
  GasFeeEstimation,
  ITokenVotingPluginInstall,
  TokenVotingClient,
  VotingMode
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Insantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// You can do different types of installations, depending on your needs.
// For ex, these would be the plugin params if you want to use an already-existing ERC20 token.
const pluginInitParams1: ITokenVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds (minimum amount is 3600)
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.STANDARD // default standard, other options: EARLY_EXECUTION, VOTE_REPLACEMENT
  },
  useToken: {
    address: "0x23847102387419273491234", // contract address of the token to use as the voting token
  }
};

// These would be the plugin params if you need to mint a new token for the DAO to enable TokenVoting.
const pluginInitParams2: ITokenVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds (minimum amount is 3600)
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.EARLY_EXECUTION // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
  },
  newToken: {
    name: "Token", // the name of your token
    symbol: "TOK", // the symbol for your token. shouldn't be more than 5 letters
    decimals: 18, // the number of decimals your token uses
    minter: "0x...", // optional. if you don't define any, we'll use the standard OZ ERC20 contract. Otherwise, you can define your own token minter contract address.
    balances: [
      { // Defines the initial balances of the new token
        address: "0x2371238740123847102983471022", // address of the account to receive the newly minted tokens
        balance: BigInt(10) // amount of tokens that address should receive
      },
      {
        address: "0x0237123874012384710298347102",
        balance: BigInt(10)
      },
      {
        address: "0x2237123874012384710298347102",
        balance: BigInt(10)
      }
    ]
  }
};

// Creates a TokenVoting plugin client with the parameteres defined above (with an existing token).
const tokenVotingInstallPluginItem1 = TokenVotingClient.encoding.getPluginInstallItem(pluginInitParams1);
// Creates a TokenVoting plugin client with the parameteres defined above (with newly minted tokens).
const tokenVotingInstallPluginItem2 = TokenVotingClient.encoding.getPluginInstallItem(pluginInitParams2);

const daoMetadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://..."
  }]
};

// Pins the DAO's metadata in IPFS to get back the URI.
const metadataUri: string = await client.methods.pinMetadata(daoMetadata);

const createParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [tokenVotingInstallPluginItem1, tokenVotingInstallPluginItem2] // optional, this will determine the plugins installed in your DAO upon creation. 1 is mandatory, more than that is optional based on the DAO's needs.
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(createParams);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Create the DAO with the two token voting plugins installed. This means that the DAO will be able to use either of the two tokens to vote depending on which TokenVoting plugin created the proposal.
const steps = client.methods.createDao(createParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log({ txHash: step.txHash });
        break;
      case DaoCreationSteps.DONE:
        console.log({ daoAddress: step.address, pluginAddresses: step.pluginAddresses });
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Create a TokenVoting proposal

In order to use the Token Voting governance mechanism within your DAO, you'll want to ensure your DAO has the TokenVoting plugin installed.
Then, you can create proposals using the `createProposal` method in your `TokenVotingClient`.

```ts
import {
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  DaoAction,
  ProposalCreationSteps,
  ProposalMetadata,
  TokenVotingClient,
  VotingMode,
  VotingSettings,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const metadata: ProposalMetadata = {
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
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  },
};

// Pin the metadata in IPFS to get back the URI.
const metadataUri: string = await tokenVotingClient.methods.pinMetadata(metadata);

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the plugin contract containing all plugin logic.

// [Optional] In case you wanted to pass an action to the proposal, you can configure it here and pass it immediately. An action is the encoded transaction which will get executed when a proposal passes.
// In this example, we are creating an action to change the settings of a governance plugin to demonstrate how to set it up.
const configActionParams: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.EARLY_EXECUTION, // default STANDARD, other options: EARLY_EXECUTION, VOTE_REPLACEMENT
};
// We need to encode the action so it can executed once the proposal passes.
const updatePluginSettingsAction: DaoAction = tokenVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionParams);

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress,
  metadataUri,
  actions: [updatePluginSettingsAction], // this is optional. if you don't want to pass any actions, simply pass an empty array `[]`.
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES // default NO, other options: ABSTAIN, YES. This saves gas for the voting transaction.
};

// Create a proposal where members participate through token voting.
const steps = tokenVotingClient.methods.createProposal(proposalParams);

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

### Create a TokenVoting proposal

Create a proposal using the TokenVoting plugin.
This proposal will be created using the TokenVoting plugin as its governance mechanism.

```ts
import {
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  ProposalCreationSteps,
  TokenVotingClient,
  VotingMode,
  VotingSettings,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// Create a config action to set the parameters of how the proposal should be initiated.
const configActionParams: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.EARLY_EXECUTION // default standard, other options: EARLY_EXECUTION, VOTE_REPLACEMENT
};

// The contract address of the token voting plugin you have installed in your DAO
const pluginAddress: string = "0x1234567890123456789012345678901234567890";

// Update the configuration of the plugin.
const configAction = tokenVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionParams);

const metadataUri: string = await tokenVotingClient.methods.pinMetadata({
  title: "Test proposal",
    summary: "This is a test proposal",
    description: "This is the description of a long test proposal",
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

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890", // the address of the TokenVoting plugin contract containing all plugin logic.
  metadataUri,
  actions: [configAction], // optional, if none, leave an empty array `[]`
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES // default NO, other options: ABSTAIN, YES
};

// Creates a proposal using the token voting governance mechanism, which executes with the parameters set in the configAction object.
const steps = tokenVotingClient.methods.createProposal(proposalParams);

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

### Check if an address can vote in a TokenVoting proposal

This function returns a boolean indicating whether an address can vote in a specific TokenVoting proposal.

```ts
import {
  ContextPlugin,
  CanVoteParams,
  TokenVotingClient,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create an TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const canVoteParams: CanVoteParams = {
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
  voterAddressOrEns: "0x1234567890123456789012345678901234567890", // your-plugin.plugin.dao.eth
  vote: VoteValues.YES // alternatively, could be  NO or ABSTAIN.
};

// Returns true or false depending on whether the address can vote in the specific proposal.
const canVote: boolean = await tokenVotingClient.methods.canVote(canVoteParams);
console.log({ canVote });
```
Returns:

```
  { canVote: true }
```

### Vote on a TokenVoting proposal

Adds a vote to a proposal using the TokenVoting governance mechanism.
The amount of votes submitted depends on the amount of tokens the signer address has.

```ts
import {
  ContextPlugin,
  IVoteProposalParams,
  TokenVotingClient,
  VoteProposalStep,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const voteParams: IVoteProposalParams = {
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
  vote: VoteValues.YES // other options: NO, ABSTAIN
};

// Creates a vote on a given proposal created by the token voting governance mechanism.
const steps = tokenVotingClient.methods.voteProposal(voteParams);

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

### Get a proposal by proposalID (TokenVoting)

Gets a specific proposal using the TokenVoting plugin as its governance mechanism.

```ts
import {
  ContextPlugin,
  TokenVotingClient,
  TokenVotingProposal
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from an Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// The address of the proposal you want to retrieve.
const proposalId: string = "0x1234567890123456789012345678901234567890_0x0";

// Get a specific proposal created using the TokenVoting plugin.
const proposal: TokenVotingProposal | null = await tokenVotingClient.methods.getProposal(proposalId);
console.log({ proposal });
```
Returns:

```
{
  id: "0x1234567890123456789012345678901234567890_0x0",
  dao: {
    address: "0x1234567890123456789012345678901234567890",
    name: "Cool DAO"
  },
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
  },
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
    minParticipation: 0.5,
    supportThreshold: 0.25,
    minDuration: 7200
  },
  token: {
    address: "0x1234567890123456789012345678901234567890",
    name: "The Token",
    symbol: "TOK",
    decimals: 18
  },
  usedVotingWeight: 1000000n,
  votes: [
    {
      address: "0x123456789123456789123456789123456789",
      vote: 2, // VoteValues.YES
      voteWeight: 700000n
    },
    {
      address: "0x234567891234567891234567891234567890",
      vote: 3, // VoteValues.NO
      voteWeight: 300000n
    }
  ]
  status: "Executed"
}
```

### Get proposals of a DAO (TokenVoting)

Gets all proposals from a DAO that are created using the TokenVoting plugin as its governance mechanism.

```ts
import {
  ContextPlugin,
  IProposalQueryParams,
  SortDirection,
  ProposalSortBy,
  ProposalStatus,
  TokenVotingClient,
  TokenVotingProposalListItem
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Create a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional
  direction: SortDirection.ASC, // optional, otherwise DESC ("descending")
  sortBy: ProposalSortBy.CREATED_AT, // optional, otherwise NAME, VOTES (POPULARITY coming soon)
  status: ProposalStatus.ACTIVE // optional, otherwise PENDING, SUCCEEDED, EXECUTED, DEFEATED
};

const proposals: TokenVotingProposalListItem[] = await tokenVotingClient.methods.getProposals(queryParams);
console.log({ proposals });
```
Returns:

```
{ proposals:
  [
    {
      id: "0x12345...",
      dao: {
        address: "0x1234567890123456789012345678901234567890",
        name: "Cool DAO"
      },
      creatorAddress: "0x1234567890123456789012345678901234567890",
      metadata: {
        title: "Test Proposal",
        summary: "Test Proposal Summary"
      },
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
      },
      creatorAddress: "0x1234567890123456789012345678901234567890",
      metadata: {
        title: "Test Proposal 2",
        summary: "Test Proposal Summary 2"
      },
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
}
```

### Get a plugin's settings (TokenVoting)

Gets the settings defined for a specific TokenVoting plugin governance mechanism installed in a DAO.

```ts
import {
  ContextPlugin,
  TokenVotingClient,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../01-setup/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an Addresslist Client
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const pluginSettings: VotingSettings | null = await tokenVotingClient.methods.getVotingSettings(pluginAddress);
console.log({ pluginSettings });
```
Returns:

```
{ pluginSettings: {
    minDuration: 10000, // 10 seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"),
    votingMode: "Standard"
  }
}
```

### Get members in a DAO (with the TokenVoting plugin installed)

Returns an array with the addresses of all the members of a specific DAO which has the TokenVoting plugin installed.

```ts
import { ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const pluginAddress: string = "0x12345384572394756239846529574932532985"; // the address of the plugin that DAO has installed. You can find this through getting the DAO details.

const members: string[] = await tokenVotingClient.methods.getMembers(pluginAddress);
console.log({ members });
```
Returns:

```
{ members:
  [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123",
    "0x5678901234567890123456789012345678901234"
  ]
}
```

### Get token details (TokenVoting)

Returns the token details used in the TokenVoting plugin for a given DAO.
These are the details of the token used to vote in that specific DAO.

```ts
import {
  ContextPlugin,
  TokenVotingClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// The address of the TokenVoting plugin whose token you want to retrieve details about.
const proposalId: string = "0x1234567890123456789012345678901234567890";

// Get the token details used in the TokenVoting plugin for a given DAO.
// ERC721 Token coming soon!
const tokenDetails = await tokenVotingClient.methods.getToken(proposalId);
console.log({ tokenDetails });
```
Returns:

```
  {
    address: "0x123456789000987654323112345678900987654321",
    name: "Token",
    symbol: "TOK",
    decimals: 18
  }
```
Or:
```
  {
    address: "0x123456789000987654323112345678900987654321",
    name: "Token",
    symbol: "TOK",
    baseUri: "base.uri"
  }
```

### Add and pin metadata

Adds and pins data with into one of the specified IPFS nodes and return an IPFS CID preceded by "ipfs://".

```ts
import {
  ContextPlugin,
  TokenVotingClient,
  ProposalMetadata
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const metadata: ProposalMetadata = {
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
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  },
};

// Pin the metadata in IPFS to get back the URI.
const metadataUri: string = await tokenVotingClient.methods.pinMetadata(metadata);
console.log({ metadataUri });
```
Returns:

```
  { metadataUri: "ipfs://Qm..." }
```
## Multisig governance plugin

The Mutisig plugin is a governance mechanism which enables x amount of signers to approve a proposal in order for it to pass.

It establishes a minimum approval threshold and a list of addresses which are allowed to vote.

### Create an Multisig client

Creating a Multisig plugin Client allows you to access the Multisig plugin from your DAO.
In order to interact with the Multisig plugin, you need to create a `MultisigClient`. This is created using the `ContextPlugin`.

```ts
import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Create a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Creates a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);
console.log({ multisigClient });
```

### Create a DAO with a Multisig plugin installed

In order to create a DAO with a Multisig plugin, you will need to first instantiate the Multisig plugin client, then use it when creating your DAO.

```ts
import {
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  GasFeeEstimation,
  MultisigClient,
  MultisigPluginInstallParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// Addresses which will be allowed to vote in the Multisig plugin.
const members: string[] = [
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123"
];

const multisigIntallParams: MultisigPluginInstallParams = {
  votingSettings: {
    minApprovals: 1,
    onlyListed: true
  },
  members
}

// Encodes the parameters of the Multisig plugin. These will get used in the installation plugin for the DAO.
const multisigInstallPluginEncodedParams = MultisigClient.encoding.getPluginInstallItem(multisigIntallParams);

// Pin metadata to IPFS, returns IPFS CID string.
const metadataUri: string = await client.methods.pinMetadata({
  name: "My DAO",
  description: "This is a description",
  avatar: "", // image url
  links: [{
    name: "Web site",
    url: "https://..."
  }],
});

const createParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [multisigInstallPluginEncodedParams]
};

// Estimate gas for the transaction.
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(createParams);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Creates a DAO with a Multisig plugin installed.
const steps = client.methods.createDao(createParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log({ txHash: step.txHash });
        break;
      case DaoCreationSteps.DONE:
        console.log({ daoAddress: step.address, pluginAddresses: step.pluginAddresses });
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Create a Multisig proposal

Creates a proposal whose governance mechanism is the Multisig plugin and its defined configuration.

```ts
import {
  Client,
  ContextPlugin,
  CreateMultisigProposalParams,
  MultisigClient,
  ProposalCreationSteps,
  ProposalMetadata,
  TokenType,
  WithdrawParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate an Aragon OSx SDK client.
const client: Client = new Client(context);
// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Insantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const proposalMetadata: ProposalMetadata = {
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
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  }
};

// Pins the metadata to IPFS and gets back an IPFS URI.
const metadataUri: string = await multisigClient.methods.pinMetadata(proposalMetadata);

// An action the proposal could take. This is only an example of an action. You can find all encoded actions within our encoders section.
const withdrawParams: WithdrawParams = {
  amount: BigInt(10), // amount in wei
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERC20 token's contract address to withdraw
  type: TokenType.ERC20,
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890", // address or ENS name to send the assets to
};

// Encodes the action of withdrawing assets from a given DAO's vault and transfers them over to the recipient address.
const withdrawAction = await client.encoding.withdrawAction(withdrawParams);

const proposalParams: CreateMultisigProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri,
  actions: [withdrawAction] // optional - if left as an empty array, no action will be set for the proposal. the action needs to be encoded and will be executed once a proposal passes.
};

// Generates a proposal with the withdraw action as passed in the proposalParams.
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

A member of a Multisig plugin is an address that is able to give their approval for a transaction to go through.
This function enables Multisig members to approve a proposal.

```ts
import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../01-setup/01-getting-started";

// Insantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client
const multisigClient = new MultisigClient(contextPlugin);

const approveParams: ApproveMultisigProposalParams = {
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
  tryExecution: true
};

const steps = multisigClient.methods.approveProposal(approveParams);

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

### Check if user can approve a transaction (Multisig)

Checks whether a user is able to participate in a proposal created using the Multisig plugin.

```ts
import {
  CanApproveParams,
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const client: MultisigClient = new MultisigClient(contextPlugin);

const canApproveParams: CanApproveParams = {
  approverAddressOrEns: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890_0x0"
};

// Checks whether the addressOrEns provided is able to approve a given proposal created with the pluginAddress.
const canApprove = await client.methods.canApprove(canApproveParams);
console.log({ canApprove });
```
Returns:

```
  { canApprove: true }
```

### Check if user can execute an action (Multisig plugin)

Checks whether the signer of the transaction is able to execute actions approved and created by proposals from the Multisig plugin.

```ts
import {
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0"

// Checks whether the signer of the transaction can execute a given proposal.
const canExecute = await multisigClient.methods.canExecute(proposalId);
console.log({ canExecute });
```
Returns:

```
  { canExecute: true }
```

### Execute the actions of a Multisig proposal

Executes the actions set within a proposal made using the Multisig plugin.

```ts
import {
  ContextPlugin,
  ExecuteProposalStep,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Insantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Insantiate a Multisig client.
const multisigClient = new MultisigClient(contextPlugin);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0"

// Executes the actions of a Multisig proposal.
const steps = multisigClient.methods.executeProposal(proposalId);

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

### Get a proposal (Multisig plugin)

Get the proposal details of a given proposal made using the Multisig plugin.

```ts
import {
  ContextPlugin,
  MultisigClient,
  MultisigProposal
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0";

const proposalDetails: MultisigProposal | null = await multisigClient.methods.getProposal(proposalId);
console.log({ proposalDetails });
```
Returns:

```
{
  id: "0x1234567890123456789012345678901234567890_0x0",
  dao: {
    address: "0x1234567890123456789012345678901234567890",
    name: "Cool DAO"
  },
  creatorAddress: "0x1234567890123456789012345678901234567890",
  metadata: {
    title: "Test Proposal",
    summary: "Test Proposal Summary",
    description: "This is a long description",
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
  },
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
    "0x234567891234567891234567891234567890"
  ]
}
```

### Get the list of a given DAO's proposals made using the Multisig plugin.

Gets the proposals made using the Multisig plugin for a given DAO.

```ts
import {
  ContextPlugin,
  IProposalQueryParams,
  MultisigClient,
  MultisigProposalListItem,
  SortDirection,
  ProposalSortBy,
  ProposalStatus
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional
  direction: SortDirection.ASC, // optional. otherwise, DESC
  sortBy: ProposalSortBy.CREATED_AT, //optional. otherwise, NAME, VOTES (POPULARITY coming soon)
  status: ProposalStatus.ACTIVE, // optional. otherwise, PENDING, SUCCEEDED, EXECUTED, DEFEATED
  daoAddressOrEns: "0x1234348529348570294650287698237520938574284357" // or my-dao.dao.eth
};

const multisigProposals: MultisigProposalListItem[] = await multisigClient.methods.getProposals(queryParams);
console.log({ multisigProposals });
```
Returns:

```
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
      summary: "Test Proposal Summary"
    };
    status: "Executed"
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
      summary: "Test Proposal Summary 2"
    };
    status: "Pending"
  }
]
```

### Get voting settings (Multisig)

Get the settings of a Multisig plugin from a specific DAO.

```ts
import {
  ContextPlugin,
  MultisigClient,
  MultisigVotingSettings
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Insantiate a Multisig client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const daoAddressorEns: string = "0x12345348523485623984752394854320";

const multisigSettings: MultisigVotingSettings = await multisigClient.methods.getVotingSettings(daoAddressorEns);
console.log({ multisigSettings });
```
Returns:
```
{
  votingSettings: {
    minApprovals: 4,
    onlyListed: true
  }
}
```

### Get the list of members (Multisig)

Gets the list of addresses able to participate in a Multisig proposal for a given DAO that has the Multisig plugin installed.

```ts
import {
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const daoAddressorEns: string = "0x1234548357023847502348"; // or my-dao.dao.eth

const multisigMembers: string[] = await multisigClient.methods.getMembers(daoAddressorEns);
console.log({ multisigMembers });
```
Returns:

```
{ multisigMembers:
  [
    "0x1234567890...",
    "0x2345678901...",
    "0x3456789012..."
  ]
}
```

### Add and pin metadata for the Multisig plugin

Adds an pin data into one of the specified IPFS nodes and return a IPFS CID preceded by "ipfs://"

```ts
import {
  ContextPlugin,
  MultisigClient,
  ProposalMetadata
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const metadata: ProposalMetadata = {
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
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  },
};

const metadataUri: string = await multisigClient.methods.pinMetadata(metadata);
console.log({ metadataUri });
```
Returns:

```
  { metadataUri: "ipfs://Qm..." }
```

## Addresslist governance plugin

The Addresslist governance plugin enables DAOs to preset an address list of approved addresses that can vote on proposals. This plugin is useful for DAOs that want to have a fixed list of addresses that can vote on proposals, without them necessarily having to own any specific tokens.

### Creating a DAO with a AddresslistVoting plugin

In order to create a DAO with a AddresslistVoting plugin, you need to first, encode the instructions for installing the plugin, based also on the pararmeters you define.
Then, use those encoded instructions when creating your DAO.

```ts
import {
  AddresslistVotingClient,
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  DaoMetadata,
  IAddresslistVotingPluginInstall,
  GasFeeEstimation,
  VotingMode
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// Define the plugins to install and their params.
const pluginInitParams: IAddresslistVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.VOTE_REPLACEMENT // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
  },
  addresses: [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123"
  ]
};

// Encodes the plugin instructions for installing into the DAO with its defined parameters.
const addresslistVotingInstallPluginInstructions = AddresslistVotingClient.encoding.getPluginInstallItem(pluginInitParams);

const daoMetadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://..."
  }],
};

// Pin metadata to IPFS, returns IPFS CID string.
const metadataUri: string = await client.methods.pinMetadata(daoMetadata);

const createParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [addresslistVotingInstallPluginInstructions]
};

// Estimate gas for the transaction.
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(createParams);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Creates a DAO with a Multisig plugin installed.
const steps = client.methods.createDao(createParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log({ txHash: step.txHash });
        break;
      case DaoCreationSteps.DONE:
        console.log({ daoAddress: step.address, pluginAddresses: step.pluginAddresses });
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
```

### Create an Address List context

Creates the context for an Addresslist plugin to be able to call on its functions.

```ts
import { ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { context, contextParams } from "../01-client/01-getting-started";

// Create a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Update the context plugin.
contextPlugin.set({ network: 1 });
contextPlugin.set({ signer: new Wallet("other private key") });
contextPlugin.setFull(contextParams);

console.log({ contextPlugin });
```

### Create an AddresslistVoting client

Creates an AddresslistVoting client allowing you to access the AddresslistVoting plugin functionality.

```ts
import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Instantiate an AddresslistVoting client from the Aragon OSx SDK context.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);
console.log({ addresslistVotingClient });
```

### Create a AddresslistVoting proposal

Creates a proposal for a DAO with the AddresslistVoting plugin installed.
Within this proposal, only addresses in the approved list of the AddresslistVoting plugin can vote.

```ts
import {
  AddresslistVotingClient,
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  VotingSettings,
  VotingMode,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Create a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddresslistVoting client.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const metadata: ProposalMetadata = {
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
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  },
};

const metadataUri: string = await addresslistVotingClient.methods.pinMetadata(metadata);

const pluginAddress = "0x1234567890123456789012345678901234567890"; // the address of the AddresslistVoting plugin installed into the DAO.

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress,
  metadataUri,
  actions: [],
  failSafeActions: [],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES // otherwise NO or ABSTAIN
};

const steps = addresslistVotingClient.methods.createProposal(proposalParams);

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

### Create a proposal with an action (AddresslistVoting)

Creates a proposal with an action(s) to get executed upon the proposal passes. Within this proposal, only addresses in the approved list of the AddresslistVoting plugin can vote.

```ts
import {
  AddresslistVotingClient,
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  MajorityVotingSettings,
  ProposalCreationSteps,
  ProposalMetadata,
  VotingMode,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Create a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddresslistVoting client from the Aragon OSx SDK context.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

// [Optional] You can add encoded actions to the proposal. These actions are the encoded transactions which will be executed when a transaction passes.
// In this example, we are updating the plugin settings as an action that you may want upon a proposal approval.
const configActionParams: MajorityVotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.EARLY_EXECUTION // alternatively, STANDARD or VOTE_REPLACEMENT
};

const pluginAddress = "0x1234567890123456789012345678901234567890"; // the address of the plugin contract itself

// Sets up the action instructions based on the above parameters.
const configAction = addresslistVotingClient.encoding.updatePluginSettingsAction(
  pluginAddress,
  configActionParams
);

const daoMetadata: ProposalMetadata = {
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
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  },
};

const metadataUri: string = await addresslistVotingClient.methods.pinMetadata(daoMetadata);

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890", // the address of the AddresslistVoting plugin contract installed in the DAO
  metadataUri,
  actions: [configAction], // the action you want to have executed upon a proposal approval
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES // otherwise NO or ABSTAIN
};

const steps = addresslistVotingClient.methods.createProposal(proposalParams);

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

### Check if an address can vote in a proposal (Addresslist)

Checks whether an address is able to participate in a DAO proposal created using the Addresslist Voting plugin.

```ts
import {
  AddresslistVotingClient,
  CanVoteParams,
  ContextPlugin,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddresslistVoting client
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const voteParams: CanVoteParams = {
  voterAddressOrEns: "0x1234567890123456789012345678901234567890", // the address who's potential to vote you want to check
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
  vote: VoteValues.YES // this doesn't execute the vote itself, simply checks whether that address can execute that vote. VoteValues can be NO, YES, or ABSTAIN
};

const canVote = await addresslistVotingClient.methods.canVote(voteParams);
console.log({ canVote });
```
Returns:

```
  { canVote: true }
```

### Vote on a Addresslist proposal

Enables voting on a proposal using the Addresslist Voting plugin installed within a DAO.

```ts
import {
  AddresslistVotingClient,
  ContextPlugin,
  IVoteProposalParams,
  VoteProposalStep,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Create a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an Addresslist client to use the Addresslist plugin.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const voteParams: IVoteProposalParams = {
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
  vote: VoteValues.YES // alternatively NO, or ABSTAIN
};

// Vote on an Addresslist proposal.
const steps = addresslistVotingClient.methods.voteProposal(voteParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case VoteProposalStep.VOTING:
        console.log({ txHash: step.txHash });
        break;
      case VoteProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error({ err });
  }
}
```

### Get the proposal by proposalId (Addresslist)

Gets a proposal created using the AddresslistVoting plugin.

```ts
import {
  AddresslistVotingClient,
  AddresslistVotingProposal,
  ContextPlugin
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddresslistVoting client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0";

const addresslistVotingProposal: AddresslistVotingProposal | null = await addresslistVotingClient.methods.getProposal(proposalId);
console.log({ addresslistVotingProposal });
```
Returns:

```
{ addresslistVotingProposal:
  {
    id: "0x1234567890123456789012345678901234567890_0x0",
    dao: {
      address: "0x1234567890123456789012345678901234567890",
      name: "Cool DAO"
    },
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
    },
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
      minParticipation: 0.5,
      supportThreshold: 0.25,
      minDuration: 7200
    },
    votes: [
      {
        address: "0x123456789123456789123456789123456789",
        vote: 2 // VoteValues.YES
      },
      {
        address: "0x234567891234567891234567891234567890",
        vote: 3 // VoteValues.NO
      }
    ]
  }
}
```

### Get proposal list (AddresslistVoting)

Gets the list of proposals created using the AddresslistVoting plugin.

```ts
import {
  AddresslistVotingProposalListItem,
  AddresslistVotingClient,
  ContextPlugin,
  IProposalQueryParams,
  ProposalSortBy,
  ProposalStatus,
  SortDirection
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an AddresslistVoting client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.CREATED_AT, //optional, alternatively NAME, VOTES (POPULARITY coming soon)
  status: ProposalStatus.ACTIVE, // optional, alternatively PENDING, SUCCEEDED, EXECUTED, DEFEATED
};

const addresslistVotingProposals: AddresslistVotingProposalListItem[] = await addresslistVotingClient.methods.getProposals(queryParams);
console.log({ addresslistVotingProposals });
```
Returns:

```
{ addresslistVotingProposals:
  [
    {
      id: "0x12345...",
      dao: {
        address: "0x1234567890123456789012345678901234567890",
        name: "Cool DAO"
      },
      creatorAddress: "0x1234567890123456789012345678901234567890",
      metadata: {
        title: "Test Proposal",
        summary: "test proposal summary"
      },
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
      },
      creatorAddress: "0x1234567890123456789012345678901234567890",
      metadata: {
        title: "Test Proposal 2",
        summary: "test proposal summary 2"
      },
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
}
```

### Get plugin settings (AddresslistVoting)

Get the settings established for a given AddresslistVoting plugin.

```ts
import {
  AddresslistVotingClient,
  ContextPlugin,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an AddresslistVoting client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the AddresslistVoting plugin contract installed in the DAO.

const addresslistVotingSettings: VotingSettings | null = await addresslistVotingClient.methods.getVotingSettings(pluginAddress);
console.log({ addresslistVotingSettings });
```
Returns:

```
{ addresslistVotingSettings:
  {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: "Standard" // default STANDARD, otherwise EARLY_EXECUTION or VOTE_REPLACEMENT
  }
}
```


### Get list of members (AddresslistVoting)

Gets an array of all addresses able to vote in a specific AddresslistVoting DAO proposal.

```ts
import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddressList client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const daoAddressorEns = "0x12345382947301297439127433492834"; // or my-dao.dao.eth

const members: string[] = await addresslistVotingClient.methods.getMembers(daoAddressorEns);
console.log({ members });
```
Returns:

```
{ members :
  [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123",
    "0x5678901234567890123456789012345678901234"
  ]
}
```

### Add and pin metadata

Adds and pin data into one of the specified IPFS nodes and return a IPFS CID preceded by "ipfs://".

```ts
import {
  AddresslistVotingClient,
  ContextPlugin,
  ProposalMetadata
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an AddresslistVoting plugin client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const proposalMetadata: ProposalMetadata = {
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
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  },
};

const proposalMetadataUri: string = await addresslistVotingClient.methods.pinMetadata(proposalMetadata);
console.log({ proposalMetadataUri });
```
```
  { proposalMetadataUri: ipfs://Qm... }
```

## Action encoders

Proposals will eventually need to execute some action on behalf of the DAO, which needs to be encoded in a low level format.

The action encoders help encoding the most typical DAO operations. The way they work is that they can only get executed once a proposal passes.

Hence, the flow is the following:
1. Encode the actions that you want to execute
2. Create a proposal with these actions in the `actions` field
3. Vote until the proposal has a majority: if the voting mode is `EARLY_EXECUTION` or until the `endDate` is achieved if the `votingMode` is  `STANDARD` or `VOTE_REPLACEMENT`
4. If the propoosal passes the required approvals and participation, execute the proposal
5. Success

### General purpose encoders
#### Grant permission

Grants permission to an address (`who`) to perform an action (`permission`) on a contract (`where`).

```ts
import {
  Client,
  DaoAction,
  IGrantPermissionParams,
  Permissions
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates a general purpose Client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const grantParams: IGrantPermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

const grantPermission: DaoAction = await client.encoding.grantAction(daoAddress, grantParams);
console.log({ grantPermission });
```
Returns:

```
{ grantPermission:
  {
    to: "0x1234567890...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
}
```

#### Grant permission based on a condition

Grants a permission to an address depending on whether a specific condition is met.

```ts
import {
  Client,
  ContextPlugin,
  DaoAction,
  GrantPermissionWithConditionParams,
  Permissions
} from "@aragon/sdk-client";
import { context } from '../01-client/01-getting-started';

// Initializes a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initializes a general purpose client from the Aragon SDK context.
const client: Client = new Client(contextPlugin);

const grantWithConditionParams: GrantPermissionWithConditionParams = {
  who: "0x1234567890123456789012345678901234567890", // address to which the permission will be granted
  where: "0x2345678901234567890123456789012345678901", // where the permission is granted
  permission: Permissions.EXECUTE_PERMISSION, // the permission to grant. alternatively: UPGRADE_PERMISSION, SET_METADATA_PERMISSION, WITHDRAW_PERMISSION, SET_SIGNATURE_VALIDATOR, SET_TRUSTED_FORWARDER_PERMISSION, ROOT_PERMISSION, CREATE_VERSION_PERMISSION, REGISTER_DAO_PERMISSION, REGISTER_PERMISSION, REGISTER_ENS_SUBDOMAIN_PERMISSION, MINT_PERMISSION, MERKLE_MINT_PERMISSION, MODIFY_ALLOWLIST_PERMISSION, SET_CONFIGURATION_PERMISSION
  condition: "0x3456789012345678901234567890123456789012" // the contract address of the condition which needs to be met in order for the permission to be granted
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123"; // "my-dao" for my-dao.dao.eth address

const grantWithConditionAction: DaoAction = client.encoding.grantWithConditionAction(
  daoAddressOrEns,
  grantWithConditionParams
);
console.log({ grantWithConditionAction });
```
Returns:

```
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```

#### Revoke a permission

Revokes a permission to a given address (`who`) to perform an action on a contract (`where`).

```ts
import {
  Client,
  DaoAction,
  IRevokePermissionParams,
  Permissions
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const revokeParams: IRevokePermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION // other options: SET_METADATA_PERMISSION, EXECUTE_PERMISSION, WITHDRAW_PERMISSION, SET_SIGNATURE_VALIDATOR_PERMISSION, SET_TRUSTED_FORWARDER_PERMISSION, ROOT_PERMISSION, CREATE_VERSION_PERMISSION, REGISTER_PERMISSION, REGISTER_DAO_PERMISSION, REGISTER_ENS_SUBDOMAIN_PERMISSION, MINT_PERMISSION, MERKLE_MINT_PERMISSION, MODIFY_ALLOWLIST_PERMISSION, SET_CONFIGURATION_PERMISSION
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

// Revokes a permission to a given address to perform an action on a contract.
const revokePermission: DaoAction = await client.encoding.revokeAction(daoAddress, revokeParams);
console.log({ revokePermission });
```
Returns:

```
{
  to: "0x1234567890...",
  value: 0n;
  data: Uint8Array[12,34,45...]
}
```

#### Register a new standard callback

Encodes the action of registering a new standard callback for the DAO.

```ts
import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from '../01-client/01-getting-started';

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize the general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const registerStandardCallbackParams = {
  interfaceId: "0x3134r1er213740123741207831238410972347",
  callbackSelector: "0x382741239807410892375182734892",
  magicNumber: "0x12192304781237401321329450123321"
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";

const registerStandardCallbackAction: DaoAction = client.encoding.registerStandardCallbackAction(
  daoAddressOrEns,
  registerStandardCallbackParams
);
console.log({ registerStandardCallbackAction });
```
Returns:
```
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```

#### Set the signature validator

Encodes the action of setting the signatura validator of the DAO.

```ts
import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from '../01-client/01-getting-started';

// Initialize the context plugin from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize the general purpose client using the plugin's context.
const client: Client = new Client(contextPlugin);

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";
const signatureValidator: string = "0x1234567890123456789012345678901234567890";

const action: DaoAction = client.encoding.setSignatureValidatorAction(
  daoAddressOrEns,
  signatureValidator
);
console.log({ action });
```
Returns:

```
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```

#### Upgrade to and call action

Encodes the action of upgrading your DAO and enforcing the call.

```ts
import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate the general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const upgradeToAndCallParams = {
  implementationAddress: "0x1234567890123456789012345678901234567890", // the implementation address to be upgraded to.
  data: new Uint8Array([10, 20, 130, 40])
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";

// Encodes the action of upgrading your DAO and enforcing the call.
const upgradeToAndCallAction: DaoAction = client.encoding.upgradeToAndCallAction(
  daoAddressOrEns,
  upgradeToAndCallParams
);
console.log({ upgradeToAndCallAction });
```
Returns:

```
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```

#### ETH Withdrawal

Withdraws ETH from a DAO's vault and transfers them to another address.
In order for a withdrawal to be successful, the address executing it must have `WITHDRAW` permissions.

```ts
import {
  Client,
  DaoAction,
  TokenType,
  WithdrawParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const withdrawParams: WithdrawParams = {
  type: TokenType.NATIVE, // "native" for ETH, otherwise use "ERC20" for ERC20 tokens and pass it the contract address of the ERC20 token
  amount: BigInt(10), // the amount in wei to withdraw
  recipientAddressOrEns: '0x1234567890123456789012345678901234567890' // the address to transfer the funds to
};

// Withdraws ETH from a given DAO and transfers them to another address.
const ethWithdraw: DaoAction = await client.encoding.withdrawAction(withdrawParams);
console.log({ ethWithdraw });
```

#### ERC-20 Withdrawal

Encodes the action for withdrawing ERC-20 tokens from a DAO's vault upon a proposal approval.

```ts
import {
  Client,
  DaoAction,
  TokenType,
  WithdrawParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a general purpose Client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const withdrawParams: WithdrawParams = {
  type: TokenType.ERC20,
  amount: BigInt(10), // amount  in wei
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERC20 token's address to withdraw
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

const erc20WithdrawAction: DaoAction = await client.encoding.withdrawAction(withdrawParams);
console.log({ erc20WithdrawAction });
```

#### ERC-721 Withdraws

Withdraws ERC-721 tokens from the DAO when a proposal passes.

```ts
import {
  Client,
  DaoAction,
  TokenType,
  WithdrawParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a general purpose client for Aragon OSx SDK context.
const client: Client = new Client(context);

const withdrawParams: WithdrawParams = {
  type: TokenType.ERC721,
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERFC721's token contract address to withdraw
  amount: BigInt(10), // amount of tokens to withdraw
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

const nftWithdrawAction: DaoAction = await client.encoding.withdrawAction(withdrawParams);
console.log({ nftWithdrawAction });
```

#### Update DAO's Metadata

Updates the metadata of a given DAO.

```ts
import {
  Client,
  DaoAction,
  DaoMetadata
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const metadataParams: DaoMetadata = {
  name: "New Name",
  description: "New description",
  avatar: "https://theavatar.com/image.jpg",
  links: [
    {
      url: "https://discord.com/...",
      name: "Discord"
    },
    {
      url: "https://twitter.com/...",
      name: "Twitter"
    }
  ]
};

const daoAddressOrEns: string = "0x123458235832745982839878932332423"; // or my-dao.dao.eth

// Pins the metadata in IPFS and returns the IPFS URI.
const ipfsUri: string = await client.methods.pinMetadata(metadataParams);

// Update the metadata of a given DAO.
const updateDaoMetadataAction: DaoAction = await client.encoding.updateDaoMetadataAction(daoAddressOrEns, ipfsUri);
console.log({ updateDaoMetadataAction });
```

#### Upgrade to action

Encodes the action of upgrading into a new implementation address.

```ts
import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";
const implementationAddress: string = "0x1234567890123456789012345678901234567890";

const upgradeToAction: DaoAction = client.encoding.upgradeToAction(
  daoAddressOrEns,
  implementationAddress
);
console.log({ upgradeToAction });
```
```
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```

### Addresslist Encoders

#### Set Plugin Config Action (Addresslist)

Updates the settings of a given AddresslistVoting plugin.

```ts
import {
  AddresslistVotingClient,
  ContextPlugin,
  DaoAction,
  VotingMode,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddresslistVoting client.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

// The action object for updating the plugin settings.
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD // default STANDARD, otherwise EARLY_EXECUTION or VOTE_REPLACEMENT
};

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the AddresslistVoting plugin contract installed in the DAO

const updatePluginSettingsAction: DaoAction = addresslistVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionPrarms);
console.log({ updatePluginSettingsAction });
```

#### Remove Members (AddressList)

Removes an address from the AddressList plugin so that this address is no longer able to vote in AddresslistVoting proposals.

```ts
import {
  AddresslistVotingClient,
  ContextPlugin,
  DaoAction
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an AddresslistVoting client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

// Addresses to remove from the AddressList plugin.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const pluginAddress: string = "0x0987654321098765432109876543210987654321"; // the address of the AddresslistVoting plugin contract installed in the DAO

const removeMembersAction: DaoAction = addresslistVotingClient.encoding.removeMembersAction(pluginAddress, members);
console.log({ removeMembersAction });
```
Returns:

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

```ts
ess is no longer able to vote in AddresslistVoting proposals.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  DaoAction
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an AddresslistVoting client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

// Addresses to remove from the AddressList plugin.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const pluginAddress: string = "0x0987654321098765432109876543210987654321"; // the address of the AddresslistVoting plugin contract installed in the DAO

const removeMembersAction: DaoAction = addresslistVotingClient.encoding.removeMembersAction(pluginAddress, members);
console.log({ removeMembersAction });
```

Returns:

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

#### Add Members (AddressList)

Adds a list of addresses to the AddressList plugin so that these new addresses are able to vote in AddresslistVoting proposals.

```ts
import {
  AddresslistVotingClient,
  DaoAction,
  ContextPlugin
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddresslistVoting client.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const pluginAddress = "0x0987654321098765432109876543210987654321"; // the address of the AddresslistVoting plugin contract installed in the DAO

const addMembersAction: DaoAction = addresslistVotingClient.encoding.addMembersAction(pluginAddress, members);
console.log({ addMembersAction });
```
Returns:

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

### Token Voting Encoders

#### Update plugin settings (TokenVoting)

Updates the configuration of a given TokenVoting plugin for a DAO.

```ts
import {
  ContextPlugin,
  DaoAction,
  TokenVotingClient,
  VotingMode,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// The new configuration parameters for the plugin
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD, // default standard, otherwise EARLY_EXECUTION or VOTE_REPLACEMENT
};

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the TokenVoting plugin contract installed in the DAO

// Updates the configuration of a TokenVoting plugin for a DAO.
const updatePluginSettingsAction: DaoAction = tokenVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionPrarms);
console.log({ updatePluginSettingsAction });
```

#### Mint tokens for a DAO (TokenVoting)

Mints tokens for a DAO that has the TokenVoting plugin installed.

```ts
import {
  ContextPlugin,
  DaoAction,
  IMintTokenParams,
  TokenVotingClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const params: IMintTokenParams = {
  address: "0x1234567890123456789012345678901234567890", // address which will receive the minted tokens
  amount: BigInt(10) // amount of tokens they will receive
};

const minterAddress: string = "0x0987654321098765432109876543210987654321"; // the contract address of the token to mint

const mintTokenAction: DaoAction = tokenVotingClient.encoding.mintTokenAction(minterAddress, params);
console.log({ mintTokenAction });
```
Returns:

```
{
  to: "0x0987654321098765432...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

### Multisig Encoders

#### Update Multisig voting confuguration

Allows you to update the voting configuration of a Multisig plugin installed in a DAO.

```ts
import {
  ContextPlugin,
  DaoAction,
  MultisigClient,
  UpdateMultisigVotingSettingsParams
} from "@aragon/sdk-client";
import { context } from "../01-setup/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const multisigClient = new MultisigClient(contextPlugin);

const updateMinApprovals: UpdateMultisigVotingSettingsParams = {
  votingSettings: {
    minApprovals: 2,
    onlyListed: false
  },
  pluginAddress: "0x0987654321098765432109876543210987654321" // the address of the Multisig plugin contract installed in the DAO
};

// Updates the voting configuration of a Multisig plugin installed in a DAO.
const updateMultisigConfig: DaoAction = multisigClient.encoding.updateMultisigVotingSettings(updateMinApprovals);
console.log({ updateMultisigConfig });
```
Returns:

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

#### Add Members (Multisig)

Adds new address as members of the Multisig plugin installed in a DAO, so they are now able to vote on proposals.

```ts
import {
  AddAddressesParams,
  ContextPlugin,
  DaoAction,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const client: MultisigClient = new MultisigClient(contextPlugin);

// The addresses to add as members.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const addAddressesParams: AddAddressesParams = {
  members,
  pluginAddress: "0x0987654321098765432109876543210987654321" // the address of the Multisig plugin contract installed in the DAO
};

// Adds the addresses as members of the Multisig plugin for a DAO.
const addAddressesToMultisig: DaoAction = client.encoding.addAddressesAction(addAddressesParams);
console.log({ addAddressesToMultisig });
```
Returns:

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

#### Remove members (Multisig plugin)

Removes a list of addresses from the Multisig plugin of a given DAO so they are no longer able to vote on Multisig proposals for that DAO.

```ts
import {
  ContextPlugin,
  DaoAction,
  MultisigClient,
  RemoveAddressesParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

// List of members to remove from the multisig plugin.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const removeAddressesParams: RemoveAddressesParams = {
  members,
  pluginAddress: "0x0987654321098765432109876543210987654321" // the address of the Multisig plugin contract installed in the DAO
};

// Removes the addresses from the Multisig plugin of a DAO.
const removeAddressesFromMultisig: DaoAction = multisigClient.encoding.removeAddressesAction(removeAddressesParams);
console.log(removeAddressesFromMultisig);
```
Returns:

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

#### Set the DAO's URI

Encodes the action of setting the DAO's URI.

```ts
import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Initializes the Context pluigin from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initializes the general purpose client using the plugin's context.
const client: Client = new Client(contextPlugin);

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";

const daoUri: string = "https://the.dao/uri"; // the URI to be defined for the DAO.

const setDaoUriAction: DaoAction = client.encoding.setDaoUriAction(
  daoAddressOrEns,
  daoUri
);
console.log({ setDaoUriAction });
```
Returns:

```
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```

## Action decoders

Decodes the actions of a transaction to understand them in a human-readable format.

### General Purpose Decoders

These are the decoders that every DAO will have, no matter which plugins they have installed.

#### Decode the grant permission action

Decodes the parameters of a grant permission action.

```ts
import {
  Client,
  IGrantPermissionDecodedParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Creates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a grant permission action.
const grantParams: IGrantPermissionDecodedParams = client.decoding.grantAction(data);
console.log({ grantParams });
```
Returns:

```
{
  who: "0x1234567890...",
  where: "0x1234567890...",
  permission: "UPGRADE_PERMISSION",
  permissionId: "0x12345..."
}
```

#### Decode revoke permission action

Decodes the action of a revoke permission transaction.

```ts
import {
  Client,
  IRevokePermissionDecodedParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Insantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the action of a revoke permission transaction.
const revokeParams: IRevokePermissionDecodedParams = client.decoding.revokeAction(data);
console.log({ revokeParams });
```
Returns:

```
{
  who: "0x1234567890...",
  where: "0x1234567890...",
  permission: "UPGRADE_PERMISSION",
  permissionId: "0x12345..."
}
```

#### Decode Withdraw Action

Decodes the parameters of a withdraw action of any token type.

```ts
import { Client, WithdrawParams } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Insantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the withdraw action.
const withdraw: WithdrawParams = client.decoding.withdrawAction(data);
console.log({ withdraw });
```
Returns:

```
{
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: 10n,
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test"
}
```

#### Decode an update metadata raw action

Decode an update metadata action and expect an IPFS URI containing the CID of the metadata.

```ts
import { Client } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Insantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of an update metadata raw action.
const decodedUpdateMetadata: string = client.decoding.updateDaoMetadataRawAction(data);
console.log({ decodedUpdateMetadata });
```
Returns:

```
  { decodedUpdateMetadata: "ipfs://Qm..." }
```

#### Decode update plugin settings action (Address List)

Decodes the action of a update plugin settings transaction.

```ts
import {
  AddresslistVotingClient,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the simple context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a AddresslistVoting plugin client.
const clientAddressList = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const pluginSettings: VotingSettings = clientAddressList.decoding.updatePluginSettingsAction(data);
console.log({ pluginSettings });
```
Returns:

```
{
  minDuration: 7200, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("1")
}
```

#### Decode Update Metadata Action

Decodes an update metadata action and expect the metadata.

```ts
import { Client, DaoMetadata } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the update metadata action.
const updateDaoMetadataParams: DaoMetadata = await client.decoding.updateDaoMetadataAction(data);
console.log({ updateDaoMetadataParams });
```
Returns:

```
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
```

#### Decode a "Register Callback" action

Decodes the action of registering a callback.

```ts
import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const registerStandardCallbackAction = client.decoding.registerStandardCallbackAction(new Uint8Array([0, 10, 20, 30]));
console.log({ registerStandardCallbackAction });
```
Returns:

```
{
  interfaceId: "0x12345678",
  callbackSelector: "0x23456789",
  magicNumber: "0x34567890"
}
```

#### Decode the "Grant with Condition" Action

Decodes the action of granting a permission based on a condition.

```ts
import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const grantWithConditionAction = client.decoding.grantWithConditionAction(new Uint8Array([0, 10, 20, 30]));
console.log({ grantWithConditionAction });
```
Returns:

```
{
  where: "0x1234567890...",
  who: "0x2345678901...",
  permission: "UPGRADE_PERMISSION"
  condition: "0x3456789012..."
  permissionId: "0x12345..."
}
```

#### Decode the Set Dao URI action

Decodes the action of setting a DAO's URI

```ts
import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client = new Client(contextPlugin);

const setDaoUriAction = client.decoding.setDaoUriAction(new Uint8Array([0, 10, 20, 30]));
console.log({ setDaoUriAction });
```
Returns:

```
  { setDaoUriAction: "https://the.dao.uri" }
```

#### Decode an "Upgrade To" action

Decodes the action of upgrading the DAO to a new implementation.

```ts
import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const upgradeToAction = client.decoding.upgradeToAction(new Uint8Array([0, 10, 20, 30]));
console.log({ upgradeToAction });
```
Returns:

```
  { upgradeToAction: "0x1234567890123456789012345678901234567890" }
```

#### Decode a "Set Signature Validator" action

Decodes the action of setting a signature validator for the DAO.

```ts
import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const setSignatureValidatorAction = client.decoding.setSignatureValidatorAction(new Uint8Array([0, 10, 20, 30]));
console.log({ setSignatureValidatorAction });
```
Returns:

```
  { setSignatureValidatorAction: "0x1234567890123456789012345678901234567890" }
```

#### Decode an "Upgrade To and Call" action

Decodes the action of upgrading the DAO to a new implementation and calling a function within it.

```ts
import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const upgradeToAndCallAction = client.decoding.upgradeToAndCallAction(new Uint8Array([10, 20, 30, 40]));
console.log({ upgradeToAndCallAction });
```
Returns:

```
  {
    implementationAddress: "0x1234567890...",
    data: Uint8Array[12,34,45...]
  }
```

### Token Voting Decoders

Decoders found in DAOs with the TokenVoting plugin installed.

#### Decode the update plugin settings action for TokenVoting plugin

Decode the parameters of an update plugin settings action for the TokenVoting plugin.

```ts
import {
  ContextPlugin,
  TokenVotingClient,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a TokenVoting plugin client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of an update plugin settings action.
const decodeUpdateTokenVotingSettings: VotingSettings = tokenVotingClient.decoding.updatePluginSettingsAction(data);
console.log({ decodeUpdateTokenVotingSettings });
```
Returns:

```
{
  minDuration: 7200, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000")
}
```

#### Get Function Parameters from an encoded action (TokenVoting)

Decodes the parameters of a function call from the TokenVoting plugin contract.

```ts
import { ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a TokenVoting plugin client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a function call from the TokenVoting plugin.
const functionParams = tokenVotingClient.decoding.findInterface(data);
console.log({ functionParams });
```
Returns:

```
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
```

#### Decode Mint Token Action (TokenVoting)

Decodes the parameters of a mint token action from the TokenVoting plugin.

```ts
import {
  ContextPlugin,
  IMintTokenParams,
  TokenVotingClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a TokenVoting plugin client.
const tokenVotingClient = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a mint token action.
const decodeMintTokenParams: IMintTokenParams = tokenVotingClient.decoding.mintTokenAction(data);
console.log({ decodeMintTokenParams });
```
Returns:

```
{
  address: "0x12345...",
  amount: 10n
}
```

### Addresslist Decoders

For DAOs who have the Addresslist Voting plugin installed.

#### Decode Add Members Action (Addresslist)

Decodes the action of adding new members to the Addresslist plugin.

```ts
import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an Addresslist plugin client.
const clientAddressList = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const membersAdded: string[] = clientAddressList.decoding.addMembersAction(data);
console.log({ membersAdded });
```
Returns:

```
{ membersAdded:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```

#### Get function parameters from  encoded action (Addresslist)

Decodes the parameters of a function call from the Addresslist plugin.

```ts
import {
  AddresslistVotingClient,
  ContextPlugin
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an Addresslist plugin client.
const client: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const functionParams = client.decoding.findInterface(data);
console.log({ functionParams });
```
Returns:

```
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
```

#### Decode Remove Members Action (AddresslistVoting)

Decodes the action of removing addresses from the AddresslistVoting plugin so they can no longer vote in AddresslistVoting proposals.

```ts
import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Insantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an Addresslist plugin client.
const clientAddressList = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const removedMembers: string[] = clientAddressList.decoding.removeMembersAction(data);
console.log({ removedMembers });
```
Returns:

```
{ removedMembers:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```

### Multisig Decoders

For DAOs that have the Multisig plugin installed.

#### Decode Add Members Action (Multisig)

Decodes the parameters of the add members action from the Multisig plugin.

```ts
import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const decodeAddMembersMultisig: string[] = multisigClient.decoding.addAddressesAction(data);
console.log({ decodeAddMembersMultisig });
```
Returns:

```
{ decodeAddMembersMultisig:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```

#### Decode Remove Members Action (Multisig)

Decodes the parameters of the remove members action from the Multisig plugin.

```ts
import {
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of the remove members action from the Multisig plugin.
const decodeRemoveMemberMultisig: string[] = multisigClient.decoding.removeAddressesAction(data);
console.log({ decodeRemoveMemberMultisig });
```
Returns:

```
{ decodeRemoveMemberMultisig:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```

#### Decodes the update settings action (Multisig).

Decodes the update settings action for a Multisig plugin.

```ts
import { ContextPlugin, MultisigClient, MultisigVotingSettings } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from an Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the update settings action for a Multisig plugin.
const decodeUpdateMultisigSettings: MultisigVotingSettings = multisigClient.decoding.updateMultisigVotingSettings(data);
console.log({ decodeUpdateMultisigSettings });
```
Returns:

```
{
  minApprovals: 2,
  onlyListed: false
}
```

#### Get function parameters from an encoded action

Decodes the parameters of a function call.

```ts
import { Client } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a function call.
const functionParams = client.decoding.findInterface(data);
console.log({ functionParams });
```
Returns:

```
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
```
