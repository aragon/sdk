/* MARKDOWN
### Decode action freeze permission
*/
import {
  Client,
  IFreezePermissionDecodedParams
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Creates an aragonOSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

const freezeParams: IFreezePermissionDecodedParams = client.decoding.freezeAction(data);
console.log({ freezeParams });

/* MARKDOWN
Returns:

```json
{
  where: "0x1234567890...",
  permission: "UPGRADE_PERMISSION",
  permissionId: "0x12345..."
}
```
*/
