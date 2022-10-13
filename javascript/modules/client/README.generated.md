

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

The [Context](../../context.ts) class is an utility component that holds the
configuration passed to any [Client](../../client.ts) instance.


```ts

import { Context } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { contextParams } from "../context";

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
import { contextParams } from "../context";
// Can be stored in a singleton and inherited from there
const context: Context = new Context(contextParams);

const client = new Client(context);

console.log(client);

```

## Creating a DAO


```ts

import {
  Client,
  Context,
  DaoCreationSteps,
  GasFeeEstimation,
  ICreateParams,
} from "@aragon/sdk-client";
import { contextParams } from "../context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const createParams: ICreateParams = {
  metadata: {
    name: "My DAO",
    description: "This is a description",
    avatar: "",
    links: [{
      name: "Web site",
      url: "https://...",
    }],
  },
  ensSubdomain: "my-org", // my-org.dao.eth,
  plugins: [],
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

## Depositing ETH to a DAO

Handles the flow of depositing the native EVM token to an Aragon DAO.


```ts

import {
  Client,
  Context,
  DaoDepositSteps,
  GasFeeEstimation,
  IDepositParams,
} from "@aragon/sdk-client";
import { contextParams } from "../context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const depositParams: IDepositParams = {
  daoAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount in wei
  reference: "test deposit", // optional
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(
  depositParams
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

## Depositing ERC20 tokens to a DAO

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
import { contextParams } from "../context";

const context = new Context(contextParams);
const client = new Client(context);
const depositParams: IDepositParams = {
  daoAddress: "0x1234567890123456789012345678901234567890",
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

## Loading Multiple DAOs

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
import { contextParams } from "../context";

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

## Loading DAO details

Handles retrieving DAO metadata using its address or ENS domain.


```ts

import { Client, Context, DaoDetails } from "@aragon/sdk-client";
import { contextParams } from "../context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const daoAddressOrEns = "0x1234567890123456789012345678901234567890" // test.dao.eth
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
      id: erc20-voting.plugin.dao.eth,
      instanceAddress: "0x12345..."
    }
  ]
}
*/

```

## Loading DAO activity

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
import { contextParams } from "../context";

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
const transfers: Transfer[] | null = await client.methods.getTransfers(params);
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
*/

```

## Context Plugin AddressList


```ts

console.log("hello")


```

## Client Plugin AddressList


```ts

console.log("hello")


```

## Context Plugin Erc20


```ts

console.log("hello")


```

## Context Plugin Erc20


```ts

console.log("hello")


```
