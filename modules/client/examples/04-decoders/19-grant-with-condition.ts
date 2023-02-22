/* MARKDOWN
### Decode Grant with Condition action
*/
import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new Client(contextPlugin);

const action = client.decoding.grantWithConditionAction(
  new Uint8Array([0, 10, 20, 30]),
);
console.log(action);
/*
  {
  where: "0x1234567890...",
  who: "0x2345678901...",
  permission: "UPGRADE_PERMISSION"
  condition: "0x3456789012..."
  permissionId: "0x12345..."
  }
  */
