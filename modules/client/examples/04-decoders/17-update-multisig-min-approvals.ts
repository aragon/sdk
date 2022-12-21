/* MARKDOWN
### Decode Remove Members Action (Multisig)
*/
import { Context, ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const multisigClient = new MultisigClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const minApprovals: bigint = multisigClient.decoding
  .updateMinApprovalsAction(data);

console.log(minApprovals);
/*
2n
*/
