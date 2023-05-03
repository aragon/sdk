/* MARKDOWN
---
title: PrepareInstallation
---

### Prepare Uninstallation of a plugin

*/

import {
  Client,
  GasFeeEstimation,
  PrepareUninstallationParams,
  PrepareUninstallationSteps,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const prepareUninstallationParams: PrepareUninstallationParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // my-dao.dao.eth
  pluginAddress: "0x2345678901234567890123456789012345678901",
  uninstallationParams: [[
    "casa",
  ]],
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation
  .prepareUninstallation(
    prepareUninstallationParams,
  );
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Deposit the ERC20 tokens.
const steps = client.methods.prepareUninstallation(prepareUninstallationParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case PrepareUninstallationSteps.PREPARING:
        console.log({ txHash: step.txHash });
        break;
      case PrepareUninstallationSteps.DONE:
        console.log({
          permissions: step.permissions,
          pluginAddress: step.pluginAddress,
          pluginRepo: step.pluginRepo,
          versionTag: step.versionTag,
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
  txhash: "0xb1c14a49...3e8620b0f5832d61c"
}
{
  permissions: ["0x123...", "0x123..."],
  pluginAddress: "0x1234567890...",
  pluginRepo: "0x1234567890..."
  versionTag: {
    build: 1,
    release: 1
  }
}
```
*/
