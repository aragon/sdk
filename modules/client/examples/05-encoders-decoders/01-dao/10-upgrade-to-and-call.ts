/* MARKDOWN
---
title: DAO Upgrade and Call
---

## Upgrade the DAO and Call a Method

Encodes the action of upgrading your DAO and doing a subsequent method call.

### Encoding
*/

import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { UpgradeToAndCallParams } from "../../../dist/interfaces";
import { context } from "../../index";

// Instantiate the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate the general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const upgradeToAndCallParams = {
  implementationAddress: "0x1234567890123456789012345678901234567890", // the implementation address to be upgraded to.
  data: new Uint8Array([10, 20, 130, 40])
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";

// Encodes the action of upgrading your DAO and doing a subsequent method call.
const action: DaoAction = client.encoding.upgradeToAndCallAction(
  daoAddressOrEns,
  upgradeToAndCallParams
);
console.log({ action });

/* MARKDOWN
Returns:

```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```

### Decoding
*/

const decodedParams: UpgradeToAndCallParams = client.decoding.upgradeToAndCallAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```
  {
    implementationAddress: "0x1234567890...",
    data: Uint8Array[12,34,45...]
  }
```
*/
