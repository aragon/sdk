/* MARKDOWN
---
title: Prepare Update
---

### Prepare the Update of the Multisig plugin

The `prepareUpdate` method performs the prior steps so that a DAO proposal can eventually apply the the update the multisig plugin.
The proposal will need an Action calling the `applyUpdate` function.

*/

import {
  MultisigClient,
  MultisigPluginPrepareUpdateParams,
  PrepareUpdateStep,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: MultisigClient = new MultisigClient(context);

const updateAbi = [/* ... */];

const prepareUpdateParams: MultisigPluginPrepareUpdateParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // my-dao.dao.eth
  pluginAddress: "0x2345678901234567890123456789012345678901",
  newVersion: {
    build: 2,
    release: 1,
  },
  updateParams: [
    // Example parameters needed by the plugin's prepareUpdate function
    1234,
    "0x1234567890123456789012345678901234567890",
  ],
  updateAbi,
};

// Estimate how much gas the transaction will cost.
const estimatedGas = await client.estimation
  .prepareUpdate(
    prepareUpdateParams,
  );
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Deposit the ERC20 tokens.
const steps = client.methods.prepareUpdate(prepareUpdateParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case PrepareUpdateStep.PREPARING:
        console.log({ txHash: step.txHash });
        break;
      case PrepareUpdateStep.DONE:
        console.log({
          permissions: step.permissions,
          pluginAddress: step.pluginAddress,
          pluginRepo: step.pluginRepo,
          versionTag: step.versionTag,
          initData: step.initData,
          helpers: step.helpers,
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
    permissions: [
      {
        operation: 1, // revoke
        where: "0x12345...",
        who: "0x23456...",
        permissionId: "0x1234567890..."
      },
      {
        operation: 1, //REVOKE
        where: "0x3456...",
        who: "0x4567...",
        permissionId: "0x1234567890..."
      }
    ],
    pluginAddress: "0x1234567890...",
    pluginRepo: "0x1234567890...",
    initData: Uint8Array(0) [],
    versionTag: {
      build: 1,
      release: 1
    },
    helpers: ["0x12345...", "0x12345..."]
  }
  ```
  */
