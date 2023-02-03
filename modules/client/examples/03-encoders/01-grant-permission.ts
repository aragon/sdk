/* MARKDOWN
### Grant permission

Grants permission to an address (`who`) to perform an action (`permission`) on a contract (`where`).
*/
import {
  Client,
  Context,
  IGrantPermissionParams,
  Permissions,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates the context from the Aragon SDK.
const context: Context = new Context(contextParams);
// Creates a Client from the Aragon SDK Context.
const client: Client = new Client(context);

const grantParams: IGrantPermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION,
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

const grantPermission = await client.encoding.grantAction(daoAddress, grantParams);
console.log({ grantPermission });

/*
Returns:
```json
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```
*/
