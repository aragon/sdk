/* MARKDOWN
### Decode Add Members Action (Address List)

Decodes the action of adding new members to the Address List plugin.
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an Addresslist plugin client.
const clientAddressList = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const membersAdded: string[] = clientAddressList.decoding.addMembersAction(data);
console.log({ membersAdded });

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
