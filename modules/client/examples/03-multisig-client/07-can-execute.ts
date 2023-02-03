/* MARKDOWN
### Check if user can execute an action in a multisig plugin

Checks whether the signer of the transaction is able to execute actions created by proposals from the Multisig plugin.
*/
import {
  CanExecuteParams,
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);
const canExecuteParams: CanExecuteParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(0)
};

// Checks whether the signer of the transaction can execute a given proposal.
const canExecute: boolean = await multisigClient.methods.canExecute(canExecuteParams);
console.log({ canExecute });

/* MARKDOWN
Returns:

```javascript
true
```
*/
