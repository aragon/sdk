/* MARKDOWN
## TokenVoting plugin client

This is a `Client`-like class, tailored to suit the specific use cases of the
built-in Token voting DAO Plugin.

Similarly to the above class, it provides high level methods that abstract the
underlying network requests.

### Creating a DAO with a TokenVoting plugin
*/

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

// Plugin params if you want to use an already existing ERC20 token
const pluginInitParams1: ITokenVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.STANDARD, // default standard
  },
  useToken: {
    address: "0x...", // contract address of the token to use
  },
};

// Plugin params if you need to mint a new token when using this plugin for the DAO
const pluginInitParams2: ITokenVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.EARLY_EXECUTION, // default standard
  },
  newToken: {
    name: "Token", // the name of your token
    symbol: "TOK", // the symbol for your token. shouldn't be more than 5 letters
    decimals: 18, // the number of decimals your token uses
    minter: "0x...", // optionally, define a minter contract address
    balances: [
      { // Initial balances of the new token
        address: "0x...", // address of the account to receive the newly minted tokens
        balance: BigInt(10), // amount of tokens that address should receive
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

// Creates a TokenVoting plugin client with the parameteres defined above (with an existing token).
const tokenVotingInstallPluginItem1 = TokenVotingClient.encoding
  .getPluginInstallItem(pluginInitParams1);
// Creates a TokenVoting plugin client with the parameteres defined above (with newly minted tokens).
const tokenVotingInstallPluginItem2 = TokenVotingClient.encoding
  .getPluginInstallItem(pluginInitParams2);

const daoMetadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
};

// Pins the DAO's metadata in IPFS to get back the URI.
const daoMetadataUri = await client.methods.pinMetadata(daoMetadata);

const createParams: CreateDaoParams = {
  daoMetadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [tokenVotingInstallPluginItem1, tokenVotingInstallPluginItem2]
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.create(createParams);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Create the DAO with the two token voting plugins installed. This means that the DAO will be able to use either of the two tokens to vote.
// You can also create a DAO with only one of the plugins.
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
