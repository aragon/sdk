/* MARKDOWN
---
title: Prepare Installation
---
### Prepare installation of a plugin

The `prepareInstallation` method performs the prior steps so that a DAO proposal can eventually apply the installation of a Plugin to the given DAO.
A governance proposal will need to be created with an action calling `applyInstallation`.

*/

import { Client } from "@aragon/sdk-client";
import {
  PrepareInstallationParams,
  PrepareInstallationStep,
} from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// Obtained from the plugin metadata
// See an example: https://github.com/aragon/simple-storage-example-plugin/blob/main/contracts/release1/build3/build-metadata-R1B3.json#L7-L20
const installationAbi = [/* ... */];

const prepareInstallationParams: PrepareInstallationParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // my-dao.dao.eth
  pluginRepo: "0x2345678901234567890123456789012345678901",
  installationParams: [
    // Example parameters needed by the plugin's prepareInstall function
    1234,
    "0x1234567890123456789012345678901234567890",
  ],
  installationAbi,
};

// Prepare the installation
const steps = client.methods.prepareInstallation(prepareInstallationParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case PrepareInstallationStep.PREPARING:
        console.log({ txHash: step.txHash });
        break;
      case PrepareInstallationStep.DONE:
        console.log({ step });
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
  txhash: "0xb1c14a49...3e8620b0f5832d61c"
}
{
  step: {
    helpers: ["0x12345...", "0x12345..."]
    pluginRepo: "0x12345...",
    pluginAdddres: "0x12345...",
    versionTag: {
      build: 1,
      release: 1
    },
    permissions: [
      {
        condition: "0x12345...",
        who: "0x12345...",
        where: "0x12345...",
        operation: 1, // GRANT
      permissionId: "0x1234567890..."
      }
    ]
  }
}
```
*/
