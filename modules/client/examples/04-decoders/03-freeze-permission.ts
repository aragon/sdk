/* MARKDOWN
### Decode action freeze permission
*/
import {
  Client,
  Context,
  IFreezePermissionDecodedParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Creates an Aragon SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

const freezeParams: IFreezePermissionDecodedParams = client.decoding.freezeAction(data);
console.log({ freezeParams });

/*
Returns:
```json
{
  where: "0x1234567890...",
  permission: "UPGRADE_PERMISSION",
  permissionId: "0x12345..."
}
```
*/
