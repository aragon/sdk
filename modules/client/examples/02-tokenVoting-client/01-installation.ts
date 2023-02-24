/* MARKDOWN
### Create a DAO with a TokenVoting plugin installed

Creates a DAO with the TokenVoting plugin installed off the bat.
*/

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
import { context } from "../00-setup/00-getting-started";

// Insantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// You can do different types of installations, depending on your needs.
// For ex, these would be the plugin params if you want to use an already-existing ERC20 token.
const pluginInitParams1: ITokenVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.STANDARD // default standard, other options: EARLY_EXECUTION, VOTE_REPLACEMENT
  },
  useToken: {
    address: "0x23847102387419273491234", // contract address of the token to use as the voting token
  },
};

// These would be the plugin params if you need to mint a new token for the DAO to enable TokenVoting.
const pluginInitParams2: ITokenVotingPluginInstall = {
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
  plugins: [tokenVotingInstallPluginItem1, tokenVotingInstallPluginItem2] // optional, this will determine the plugins installed in your DAO upon creation.
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(createParams);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Create the DAO with the two token voting plugins installed. This means that the DAO will be able to use either of the two tokens to vote.
// You can also create a DAO with only one of the plugins installed or none.
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
    console.error({ err });
  }
}
