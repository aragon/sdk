/* MARKDOWN
---
title: Grant Permissions
---

## Grant a Permission

Grants permission with the name (`permission`) to an address (`who`) to perform on a target contract (`where`).

### Encoding
*/

import {
  Client,
  DaoAction,
  IGrantPermissionParams,
  IGrantPermissionDecodedParams,
  Permissions
} from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiates a general purpose Client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const params: IGrantPermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

const action: DaoAction = await client.encoding.grantAction(daoAddress, params);
console.log({ action });

/* MARKDOWN
Returns:

```json
{ grantPermission:
  {
    to: "0x1234567890...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
}
```

### Decoding
*/

// Decodes the data of a grant permission action.
const decodedParams: IGrantPermissionDecodedParams = client.decoding.grantAction(
  action.data
);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```json
{
  who: "0x1234567890...",
  where: "0x1234567890...",
  permission: "UPGRADE_PERMISSION",
  permissionId: "0x12345..."
}
```
*/
