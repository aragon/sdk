/* MARKDOWN
### Decode action revoke permission
*/
import {
  Client,
  Context,
  IRevokePermissionDecodedParams,
} from "@aragon/sdk-client";
import { contextParams } from "../context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

const revokeParams: IRevokePermissionDecodedParams = client.decoding
  .revokeAction(data);
console.log(revokeParams);
/*
{
  who: "0x1234567890...",
  where: "0x1234567890...",
  permission: "UPGRADE_PERMISSION",
  permissionId: "0x12345..."
}
*/
