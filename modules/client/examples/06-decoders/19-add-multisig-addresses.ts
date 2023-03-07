/* MARKDOWN
### Multisig Decoders

#### Decode Add Members Action (Multisig)

Decodes the parameters of the add members action from the Multisig plugin.
*/

import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const decodeAddMembersMultisig: string[] = multisigClient.decoding.addAddressesAction(data);
console.log({ decodeAddMembersMultisig });

/* MARKDOWN
Returns:

```
{ decodeAddMembersMultisig:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```
*/
