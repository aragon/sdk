/* MARKDOWN
### Check if user can approve a transaction (Multisig)

Checks whether a user is able to participate in a proposal created using the Multisig plugin.
*/

import {
  CanApproveParams,
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const client = new MultisigClient(contextPlugin);

const canApproveParams: CanApproveParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  addressOrEns: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(0)
};

// Checks whether the signer of the transaction can approve a given proposal.
const canApprove = await client.methods.canApprove(canApproveParams);
console.log({ canApprove });

/* MARKDOWN
Returns:

```javascript
true
```
*/
