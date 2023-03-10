/* MARKDOWN
---
title: Upgrade To
---

## Upgrade the DAO 

Encodes the action of upgrading the DAO proxy contract to a new implementation address.

### Encoding
*/

import { Client, DaoAction } from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";
const implementationAddress: string = "0x1234567890123456789012345678901234567890";

const action: DaoAction = client.encoding.upgradeToAction(
  daoAddressOrEns,
  implementationAddress
);
console.log({ action });

/* MARKDOWN

```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```

### Decoding
*/

const decodedParams: string = client.decoding.upgradeToAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```
  { decodedParams: "0x1234567890123456789012345678901234567890" }
```
*/
