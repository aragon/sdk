/* MARKDOWN
### Grant permission
*/
import {
  Client,
  Context,
  IGrantPermissionParams,
  Permissions,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const grantParams: IGrantPermissionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION,
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const grantAction = await client.encoding.grantAction(
  daoAddress,
  grantParams,
);
console.log(grantAction);
/*
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
