/* MARKDOWN
---
title: Create Addresslist Voting DAO
---

## Create a DAO with a Addresslist Voting Plugin Installed

The Addresslist governance plugin enables DAOs to preset an address list of approved addresses that can vote on proposals. This plugin is useful for DAOs that want to have a fixed list of addresses that can vote on proposals, without them necessarily having to own any specific tokens.

In order to create a DAO with a AddresslistVoting plugin, you need to first, encode the instructions for installing the plugin, based also on the pararmeters you define.
Then, use those encoded instructions when creating your DAO.
*/

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
import { context } from "../index";

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
