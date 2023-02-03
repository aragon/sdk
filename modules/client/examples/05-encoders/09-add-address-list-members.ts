/* MARKDOWN
### Add Members (AddressList)
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new AddresslistVotingClient(contextPlugin);

const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const pluginAddress = "0x0987654321098765432109876543210987654321";
const action = client.encoding.addMembersAction(pluginAddress, members);
console.log(action);

/* MARKDOWN
Returns:

```json
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```
*/
