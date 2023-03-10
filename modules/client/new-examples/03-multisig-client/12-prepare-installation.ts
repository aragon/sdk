/* MARKDOWN
### Prepare the installation of a multisig plugin
*/

import {
  ContextPlugin,
  MultisigClient,
  PrepareInstallationStep,
  MultisigPluginPrepareInstallationParams,
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create an Multisig client.
const multisigClient: MultisigClient = new MultisigClient(
  contextPlugin,
);

const installationParams: MultisigPluginPrepareInstallationParams = {
  settings: {
    votingSettings: {
      minApprovals: 5,
      onlyListed: true
    },
    members: [
      "0x1234567890123456789012345678901234567890"
    ]
  },
  daoAddressOrEns: "0x1234567890123456789012345678901234567890",
};
const steps = multisigClient.methods.prepareInstallation(installationParams);
for await (const step of steps) {
  switch (step.key) {
    case PrepareInstallationStep.PREPARING:
      console.log(step.txHash);
      break;
    case PrepareInstallationStep.DONE:
      console.log({ step });
      break;
  }
}

/* MARKDOWN
Returns:
```tsx
  step:{
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
        permissionId: Uint8Array([10, 20, 30])
      }
    ]
  }
```
*/
