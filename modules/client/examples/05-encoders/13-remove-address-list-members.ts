/* MARKDOWN
#### Remove Members (AddressList)

Removes an address from the AddressList plugin so that this address is no longer able to vote in AddresslistVoting proposals.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  DaoAction
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an AddresslistVoting client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

// Addresses to remove from the AddressList plugin.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const pluginAddress: string = "0x0987654321098765432109876543210987654321"; // the address of the AddresslistVoting plugin contract installed in the DAO

const removeMembersAction: DaoAction = addresslistVotingClient.encoding.removeMembersAction(pluginAddress, members);
console.log({ removeMembersAction });

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
