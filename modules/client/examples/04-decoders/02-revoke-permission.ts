/* MARKDOWN
### Decode action revoke permission

Decodes the action of a revoke permission transaction.
*/

import {
  Client,
  Context,
  IRevokePermissionDecodedParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Creates an Aragon SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the action of a revoke permission transaction.
const revokeParams: IRevokePermissionDecodedParams = client.decoding.revokeAction(data);
console.log({ revokeParams });

/*
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
