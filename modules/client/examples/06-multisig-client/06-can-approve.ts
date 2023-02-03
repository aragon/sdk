/* MARKDOWN
### Check if user can approve a transaction in a Multisig proposal.

Checks whether a user is able to participate in a proposal created using the Multisig plugin.
*/

import {
  CanApproveParams,
  Context,
  ContextPlugin,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a Multisig client.
const client = new MultisigClient(contextPlugin);

const canApproveParams: CanApproveParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  addressOrEns: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(0)
};

// Checks whether the signer of the transaction can approve a given proposal.
const canApprove = await client.methods.canApprove(canApproveParams);
console.log({ canApprove });

/*
Returns:
```javascript
true
```
*/
