/* MARKDOWN
### Revoke permission
*/
import {
  Client,
  Context,
  IRevokePermissionParams,
  Permissions,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const revokeParams: IRevokePermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION,
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const revokeAction = await client.encoding.revokeAction(
  daoAddress,
  revokeParams,
);
console.log(revokeAction);
/*
{
  to: "0x1234567890...",
  value: 0n;
  data: Uint8Array[12,34,45...]
}
*/
