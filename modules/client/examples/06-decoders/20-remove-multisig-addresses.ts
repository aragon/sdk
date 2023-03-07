/* MARKDOWN
#### Decode Remove Members Action (Multisig)

Decodes the parameters of the remove members action from the Multisig plugin.
*/

import {
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of the remove members action from the Multisig plugin.
const decodeRemoveMemberMultisig: string[] = multisigClient.decoding.removeAddressesAction(data);
console.log({ decodeRemoveMemberMultisig });

/* MARKDOWN
Returns:

```
{ decodeRemoveMemberMultisig:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```
*/
