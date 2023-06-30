/* MARKDOWN
---
title: Upgrade To And Call
---

## Upgrade the DAO and Call a Method

Encodes the action of upgrading your DAO and doing a subsequent method call.

### Encoding
*/

import { Client, UpgradeToAndCallParams } from "@aragon/sdk-client";
import { DaoAction } from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const upgradeToAndCallParams = {
  implementationAddress: "0x1234567890123456789012345678901234567890", // the implementation address to be upgraded to.
  data: new Uint8Array([10, 20, 130, 40]),
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";

// Encodes the action of upgrading your DAO and doing a subsequent method call.
const action: DaoAction = client.encoding.upgradeToAndCallAction(
  daoAddressOrEns,
  upgradeToAndCallParams,
);
console.log({ action });

/* MARKDOWN
Returns:

```json
{ action:
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
}
```

### Decoding
*/

const decodedParams: UpgradeToAndCallParams = client.decoding
  .upgradeToAndCallAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```
{ decodedParams:
  {
    implementationAddress: "0x1234567890...",
    data: Uint8Array[12,34,45...]
  }
}
```
*/
