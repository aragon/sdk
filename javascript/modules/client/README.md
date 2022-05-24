# @aragon/sdk-client

@aragon/sdk-client contains the high level operations for interacting with the Aragon ecosystem

## Installation

Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install @aragon/sdk-client.

```bash
npm install @aragon/sdk-client
yarn add @aragon/sdk-client
```

## Usage

#### DAO Creation

###### DAO ERC20 Voting

```ts
// For local testing
const contextParams: ContextParams = {
    network: 31337,
    signer: new Wallet("privateKey"),
    daoFactoryAddress: "0x1234...", // Optional on networks like "rinkeby", "arbitrum-rinkeby" or "mumbai"
    web3Providers: ["http://localhost:8545"],
};
const context = new Context(contextParams);

const client = new ClientDaoERC20Voting(context);

const daoCreationParams: ICreateDaoERC20Voting = {
    daoConfig: {
        name: "ERC20VotingDAO_" + Math.floor(Math.random() * 9999) + 1,
        metadata: "0x1234",
    },
    tokenConfig: {
        address: "0x0000000000000000000000000000000000000000",
        name:
            "TestToken" +
            (Math.random() + 1)
                .toString(36)
                .substring(4)
                .toUpperCase(),
        symbol:
            "TEST" +
            (Math.random() + 1)
                .toString(36)
                .substring(4)
                .toUpperCase(),
    },
    mintConfig: [
        {
            address: Wallet.createRandom().address,
            balance: BigInt(Math.floor(Math.random() * 9999) + 1),
        },
        {
            address: Wallet.createRandom().address,
            balance: BigInt(Math.floor(Math.random() * 9999) + 1),
        },
    ],
    votingConfig: {
        minSupport: Math.floor(Math.random() * 100) + 1,
        minParticipation: Math.floor(Math.random() * 100) + 1,
        minDuration: Math.floor(Math.random() * 9999) + 1,
    },
    gsnForwarder: Wallet.createRandom().address,
};

const gasFeesEstimation = await client.estimate.create(daoCreationParams);
console.log(gasFeesEstimation)
// {
//   average: 4670887392191186n, // Average gas fee estimation (reducing the max value by heuristic) 
//   max: 7473419827505898n // Maximum gas fee estimation
// }

const newDaoAddress = await client.dao.create(daoCreationParams);
console.log(newDaoAddress) // New DAO address
```

###### DAO Whitelist Voting

```ts
// For local testing
const contextParams: ContextParams = {
    network: 31337,
    signer: new Wallet("privateKey"),
    daoFactoryAddress: "0x1234...", // Optional on networks like "rinkeby", "arbitrum-rinkeby" or "mumbai"
    web3Providers: ["http://localhost:8545"],
};
const context = new Context(contextParams);

const client = new ClientDaoWhitelistVoting(context);

const daoCreationParams: ICreateDaoWhitelistVoting = {
    daoConfig: {
        name: "WhitelistVotingDAO_" + Math.floor(Math.random() * 9999) + 1,
        metadata: "0x1234",
    },
    votingConfig: {
        minSupport: Math.floor(Math.random() * 100) + 1,
        minParticipation: Math.floor(Math.random() * 100) + 1,
        minDuration: Math.floor(Math.random() * 9999) + 1,
    },
    whitelistVoters: [
        Wallet.createRandom().address,
        Wallet.createRandom().address,
    ],
    gsnForwarder: Wallet.createRandom().address,
};

const gasFeesEstimation = await client.estimate.create(daoCreationParams);
// {
//   average: 4670887392191186n, // Average gas fee estimation (reducing the max value by heuristic) 
//   max: 7473419827505898n // Maximum gas fee estimation
// }

const newDaoAddress = await client.dao.create(daoCreationParams);
console.log(newDaoAddress) // New DAO address
```

#### Proposal Creation

###### ERC20 Voting Proposal

```ts
// For local testing
const contextParams: ContextParams = {
    network: 31337,
    signer: new Wallet("privateKey"),
    daoFactoryAddress: "0x1234...", // Optional on networks like "rinkeby", "arbitrum-rinkeby" or "mumbai"
    web3Providers: ["http://localhost:8545"],
};
const context = new Context(contextParams);

const client = new ClientDaoERC20Voting(context);

const proposalCreationParams: ICreateProposal = {
    metadata: "0x1234", // IPFS CID
    executeIfDecided: true,
    creatorChoice: VoteOption.YEA,
};

const newProposalId = await client.dao.simpleVote.createProposal(
    "votingAddress",
    proposalCreationParams
);
console.log(newProposalId) // New proposal id
```

###### Whitelist Voting Proposal

```ts
// For local testing
const contextParams: ContextParams = {
    network: 31337,
    signer: new Wallet("privateKey"),
    daoFactoryAddress: "0x1234...", // Optional on networks like "rinkeby", "arbitrum-rinkeby" or "mumbai"
    web3Providers: ["http://localhost:8545"],
};
const context = new Context(contextParams);

const client = new ClientDaoWhitelistVoting(context);

const proposalCreationParams: ICreateProposal = {
    metadata: "0x1234",
    executeIfDecided: true,
    creatorChoice: VoteOption.YEA,
};

const newProposalId = await client.dao.whitelist.createProposal(
    "votingAddress",
    proposalCreationParams
);
console.log(newProposalId) // New proposal id
```

#### Deposit to DAO

###### Deposit ETH to ERC20Voting and WhitelistVoting DAOs

```ts
const client = new ClientDaoERC20Voting(context);
// or
const client = new ClientDaoWhitelistVoting(context);

const depositParams: IDeposit = {
    daoAddress: newDaoAddress,
    token: null,
    amount: BigInt(10), // Ethers amount in Gwei
    reference: "Reference of the deposit (reason)", // Optional
};

await client.dao.deposit(depositParams);
```

###### Deposit ERC20 token to ERC20Voting and WhitelistVoting DAOs

```ts
const client = new ClientDaoERC20Voting(context);
// or
const client = new ClientDaoWhitelistVoting(context);

const depositParams: IDeposit = {
    daoAddress: newDaoAddress,
    token: "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877", // Token Address
    amount: BigInt(10), // ERC20 token units amount
    reference: "Reference of the deposit (reason)", // Optional
};

await client.dao.deposit(depositParams);
```

#### Actions helpers

###### Withdraw

```ts
const client = new ClientDaoERC20Voting(context);
// or
const client = new ClientDaoWhitelistVoting(context);

const withdrawParams: IWithdraw = {
    to: "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877",
    amount: BigInt(10),
    reference: "Test",
};

const withdrawAction = client.actions.withdraw(
    "0x9a16078c911afAb4CE4B7d261A67F8DF99fAd877",
    BigInt(1),
    withdrawParams
);

console.log(withdrawAction) // Encoded withdraw action
```

## Testing

To execute library tests just run

```bash
yarn test
```
