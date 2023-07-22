/* MARKDOWN
---
title: Create a DAO
---

## Create a DAO

The `createDao` function allows you to create a DAO using the parameters you set for it.
*/

import {
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  DaoMetadata,
  TokenVotingPluginInstall,
  TokenVotingClient,
  VotingMode,
} from "@aragon/sdk-client";
import { GasFeeEstimation } from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const metadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "image-url",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
};

// Through pinning the metadata in IPFS, we can get the IPFS URI. You can read more about it here: https://docs.ipfs.tech/how-to/pin-files/
const metadataUri = await client.methods.pinMetadata(metadata);

// You need at least one plugin in order to create a DAO. In this example, we'll use the TokenVoting plugin, but feel free to install whichever one best suites your needs. You can find resources on how to do this in the plugin sections.
// These would be the plugin params if you need to mint a new token for the DAO to enable TokenVoting.
const tokenVotingPluginInstallParams: TokenVotingPluginInstall = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.EARLY_EXECUTION, // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
  },
  newToken: {
    name: "Token", // the name of your token
    symbol: "TOK", // the symbol for your token. shouldn't be more than 5 letters
    decimals: 18, // the number of decimals your token uses
    minter: "0x...", // optional. if you don't define any, we'll use the standard OZ ERC20 contract. Otherwise, you can define your own token minter contract address.
    balances: [
      { // Defines the initial balances of the new token
        address: "0x2371238740123847102983471022", // address of the account to receive the newly minted tokens
        balance: BigInt(10), // amount of tokens that address should receive
      },
    ],
  },
};

// Creates a TokenVoting plugin client with the parameteres defined above (with an existing token).
const tokenVotingInstallItem = TokenVotingClient.encoding
  .getPluginInstallItem(tokenVotingPluginInstallParams, "goerli");

const createDaoParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [tokenVotingInstallItem], // plugin array cannot be empty or the transaction will fail. you need at least one governance mechanism to create your DAO.
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(
  createDaoParams,
);
console.log({ avg: estimatedGas.average, maximum: estimatedGas.max });

// Create the DAO.
const steps = client.methods.createDao(createDaoParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log({ txHash: step.txHash });
        break;
      case DaoCreationSteps.DONE:
        console.log({
          daoAddress: step.address,
          pluginAddresses: step.pluginAddresses,
        });
        break;
    }
  } catch (err) {
    console.error(err);
  }
}

/* MARKDOWN
Returns:
```tsx
{
  txHash: "0xb1c14a49...3e8620b0f5832d61c"
}
{
  daoAddress: "0xb1c14a49...3e8620b0f5832d61c",
  pluginAddresses: ["0xb1c14a49...3e8620b0f5832d61c", "0xb1c14a49...3e8620b0f5832d61c"]
}
```
*/
