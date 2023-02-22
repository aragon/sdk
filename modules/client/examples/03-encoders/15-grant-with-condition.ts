/* MARKDOWN
### Grant with Condition
*/
import {
  Client,
  Context,
  ContextPlugin,
  GrantPermissionWithConditionParams,
  Permissions,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new Client(contextPlugin);

const grantWithConditionParams: GrantPermissionWithConditionParams = {
  who: "0x1234567890123456789012345678901234567890",
  where: "0x2345678901234567890123456789012345678901",
  permission: Permissions.EXECUTE_PERMISSION,
  condition: "0x3456789012345678901234567890123456789012",
};
const daoAddressOrEns = "0x123123123123123123123123123123123123";
const action = client.encoding.grantWithConditionAction(
  daoAddressOrEns,
  grantWithConditionParams,
);
console.log(action);
/*
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
  */
