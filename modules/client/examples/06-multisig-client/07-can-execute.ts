/* MARKDOWN
### Check if user can execute an action in a multisig plugin

Checks whether the signer of the transaction is able to execute actions created by proposals from the Multisig plugin.
*/
import {
  CanExecuteParams,
  Context,
  ContextPlugin,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);
const canExecuteParams: CanExecuteParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(0)
};

// Checks whether the signer of the transaction can execute a given proposal.
const canExecute = await multisigClient.methods.canExecute(canExecuteParams);
console.log({ canExecute });

/*
Returns:
```javascript
true
```
*/
