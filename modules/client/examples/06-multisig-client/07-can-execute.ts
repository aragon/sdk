/* MARKDOWN
### Checking if user can approve in a multisig plugin
*/
import {
  CanExecuteParams,
  Context,
  ContextPlugin,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);
const canExecuteParams: CanExecuteParams = {
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
};
const canExecute = await client.methods.canExecute(canExecuteParams);
console.log(canExecute);
/*
true
*/
