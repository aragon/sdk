/* MARKDOWN
### Grant permission

Grants permission to an address (`who`) to perform an action (`permission`) on a contract (`where`).
*/

import {
  Client,
  DaoAction,
  IGrantPermissionParams,
  Permissions
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

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
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```
*/
