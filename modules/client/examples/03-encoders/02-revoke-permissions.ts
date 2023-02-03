/* MARKDOWN
### Revoke a permission

Revokes a permission to a given address (`who`) to perform an action on a contract (`where`).
*/
import {
  Client,
  Context,
  IRevokePermissionParams,
  Permissions,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create an Aragon SDK client.
const client: Client = new Client(context);

const revokeParams: IRevokePermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION,
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

// Revokes a permission to a given address to perform an action on a contract.
const revokePermission = await client.encoding.revokeAction(daoAddress, revokeParams);
console.log({ revokePermission });

/*
Returns:
```json
{
  to: "0x1234567890...",
  value: 0n;
  data: Uint8Array[12,34,45...]
}
```
*/
