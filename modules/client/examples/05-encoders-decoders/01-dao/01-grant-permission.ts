/* MARKDOWN
---
title: Grant Permissions
---

## Grant a Permission

Grants permission to an address (`who`) to perform an action (`permission`) on a contract (`where`).
*/

import {
  Client,
  DaoAction,
  IGrantPermissionParams,
  Permissions
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiates a general purpose Client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const grantParams: IGrantPermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

const grantPermission: DaoAction = await client.encoding.grantAction(daoAddress, grantParams);
console.log({ grantPermission });

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
*/

/* MARKDOWN
---
title: Grant Permission
---

## Decode the Grant Permission Action

Decodes the parameters of a grant permission action.
*/

import {
  Client,
  IGrantPermissionDecodedParams
} from "@aragon/sdk-client";
import { context } from "../index";

// Creates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a grant permission action.
const grantParams: IGrantPermissionDecodedParams = client.decoding.grantAction(data);
console.log({ grantParams });

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