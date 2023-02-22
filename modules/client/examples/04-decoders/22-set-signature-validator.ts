/* MARKDOWN
### Decode a set signature validator action
*/
import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new Client(contextPlugin);
const decodedAction = client.decoding.setSignatureValidatorAction(
  new Uint8Array([0, 10, 20, 30]),
);
console.log(decodedAction);
/*
  "0x1234567890123456789012345678901234567890"
*/
