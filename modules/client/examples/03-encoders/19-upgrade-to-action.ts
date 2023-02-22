/* MARKDOWN
### Upgrade to action
*/
import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new Client(contextPlugin);
const daoAddressOrEns = "0x123123123123123123123123123123123123";
const implementationAddress = "0x1234567890123456789012345678901234567890";
const action = client.encoding.upgradeToAction(
  daoAddressOrEns,
  implementationAddress,
);
console.log(action);
/*
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
  */
