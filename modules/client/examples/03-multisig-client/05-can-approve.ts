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

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const client: MultisigClient = new MultisigClient(contextPlugin);

const canApproveParams: CanApproveParams = {
  addressOrEns: "0x1234567890123456789012345678901234567890",
  pluginAddress: "0x1234567890123456789012345678901234567890"
};

// Checks whether the addressOrEns provided is able to approve a given proposal created with the pluginAddress.
const canApprove = await client.methods.canApprove(canApproveParams);
console.log({ canApprove });

/* MARKDOWN
Returns:

```javascript
  { canApprove: true }
```
*/
