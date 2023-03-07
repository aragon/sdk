/* MARKDOWN
### Addresslist Decoders

#### Decode Add Members Action (Addresslist)

Decodes the action of adding new members to the Addresslist plugin.
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an Addresslist plugin client.
const clientAddressList = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const membersAdded: string[] = clientAddressList.decoding.addMembersAction(data);
console.log({ membersAdded });

/* MARKDOWN
Returns:

```
{ membersAdded:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```
*/
