/* MARKDOWN
### Decode Add Members Action in a Multisig plugin

Decodes the parameters of the add members action from the Multisig plugin.
*/

import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const decodeAddMembersMultisig: string[] = multisigClient.decoding.addAddressesAction(data);
console.log({ decodeAddMembersMultisig });

/* MARKDOWN
Returns:

```json
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
```
*/
