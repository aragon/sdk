/* MARKDOWN
---
title: Prepare Installation
---

## Prepare the Installation of a Multisig Plugin
*/

import {
  MultisigClient,
  MultisigPluginPrepareInstallationParams,
  PrepareInstallationStep,
} from "@aragon/sdk-client";
import { context } from "../index";

// Create an Multisig client.
const multisigClient: MultisigClient = new MultisigClient(
  context,
);

const installationParams: MultisigPluginPrepareInstallationParams = {
  settings: {
    votingSettings: {
      minApprovals: 5,
      onlyListed: true,
    },
    members: [
      "0x1234567890123456789012345678901234567890",
    ],
  },
  daoAddressOrEns: "0x1234567890123456789012345678901234567890",
};
const steps = multisigClient.methods.prepareInstallation(installationParams);
for await (const step of steps) {
  switch (step.key) {
    case PrepareInstallationStep.PREPARING:
      console.log({ txHash: step.txHash });
      break;
    case PrepareInstallationStep.DONE:
      console.log({ step });
      break;
  }
}

/* MARKDOWN
Returns:
```tsx
{
  txHash: "0xb1c14a49...3e8620b0f5832d61c"
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
