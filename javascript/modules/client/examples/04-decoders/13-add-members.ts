/* MARKDOWN
### Decode Add Members Action (Address List)
*/
import { ClientAddressList, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientAddressList = new ClientAddressList(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const members: string[] = clientAddressList.decoding.addMembersAction(data);

console.log(members);
/*
[
  "0x12345...",
  "0x56789...",
  "0x13579...",
]
*/
