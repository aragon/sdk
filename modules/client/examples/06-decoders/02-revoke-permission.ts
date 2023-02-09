/* MARKDOWN
### Decode revoke permission action

Decodes the action of a revoke permission transaction.
*/

import {
  Client,
  IRevokePermissionDecodedParams
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Insantiates an aragonOSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the action of a revoke permission transaction.
const revokeParams: IRevokePermissionDecodedParams = client.decoding.revokeAction(data);
console.log({ revokeParams });

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
