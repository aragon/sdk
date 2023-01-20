/* MARKDOWN
### Decode Remove Members Action (Address List)
*/
import { AddresslistVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientAddressList = new AddresslistVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const members: string[] = clientAddressList.decoding.removeMembersAction(data);

console.log(members);
/*
[
  "0x12345...",
  "0x56789...",
  "0x13579...",
]
*/
