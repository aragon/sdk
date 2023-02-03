/* MARKDOWN
### Decode Add Members Action (Address List)

*/

import { AddresslistVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientAddressList = new AddresslistVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const members: string[] = clientAddressList.decoding.addMembersAction(data);
console.log(members);

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
