/* MARKDOWN
## Multisig governance plugin

The Mutisig plugin is a governance mechanism which establishes that x amount of signers must approve a proposal in order for it to pass.
It establishes a minimum approval threshold and a list of addresses which are allowed to vote.

### Creating a DAO with a Multisig plugin
In order to create a DAO with a Multisig plugin, you will need to first instantiate the Multisig plugin client, then use it when creating your DAO.
*/

import {
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  GasFeeEstimation,
  MultisigPluginInstallParams
} from "@aragon/sdk-client";
import { MultisigClient } from "../../src";
import { context } from "../00-setup/00-getting-started";

// Instantiate a client from the aragonOSx SDK context.
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

const multisigInstallPluginItem = MultisigClient.encoding.getPluginInstallItem(multisigIntallParams);

// Pin metadata to IPFS, returns IPFS CID string.
const metadataUri: string = await client.methods.pinMetadata({
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://..."
  }],
});

const createParams: CreateDaoParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [multisigInstallPluginItem]
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
