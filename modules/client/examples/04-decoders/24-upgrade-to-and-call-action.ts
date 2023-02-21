/* MARKDOWN
### Decaode an upgrade to and call action
*/
import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new Client(contextPlugin);

const decodedAction = client.decoding.upgradeToAndCallAction(
  new Uint8Array([10, 20, 30, 40]),
);
console.log(decodedAction);
/*
  {
    implementationAddress: "0x1234567890...",
    data: Uint8Array[12,34,45...]
  }
*/
