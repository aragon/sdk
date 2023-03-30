/* MARKDOWN
---
title: Create Multisig DAO
---

## Create a DAO with a Multisig Installed

The Mutisig plugin is a governance plugin which enables x out of y signers to approve a proposal in order for it to pass.
It establishes a minimum approval threshold and a list of addresses which are allowed to vote.

In order to create a DAO with a Multisig plugin, you will need to first instantiate the Multisig plugin client, then use it when creating your DAO.
*/

import {
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  GasFeeEstimation,
  MultisigClient,
  MultisigPluginInstallParams,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// Addresses which will be allowed to vote in the Multisig plugin.
const members: string[] = [
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
];

const multisigPluginIntallParams: MultisigPluginInstallParams = {
  votingSettings: {
    minApprovals: 1,
    onlyListed: true,
  },
  members,
};

// Encodes the parameters of the Multisig plugin. These will get used in the installation plugin for the DAO.
const multisigPluginInstallItem = MultisigClient.encoding
  .getPluginInstallItem(multisigPluginIntallParams);

// Pin metadata to IPFS, returns IPFS CID string.
const metadataUri: string = await client.methods.pinMetadata({
  name: "My DAO",
  description: "This is a description",
  avatar: "", // image url
  links: [{
    name: "Web site",
    url: "https://...",
  }],
});

const createParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [multisigPluginInstallItem],
};

// Estimate gas for the transaction.
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(
  createParams,
);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Creates a DAO with a Multisig plugin installed.
const steps = client.methods.createDao(createParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log({ txHash: step.txHash }); // { txHash: "0xb1c14a49...3e8620b0f5832d61c" }
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
  daoAddress: "0xb1c14a49...3e8620b0f5832d61c",
  pluginAddresses: ["0xb1c14a49...3e8620b0f5832d61c", "0xb1c14a49...3e8620b0f5832d61c"]
}
```
*/