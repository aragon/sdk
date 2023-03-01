/* MARKDOWN
#### Add Members (Multisig)

Adds new address as members of the Multisig plugin installed in a DAO, so they are now able to vote on proposals.
*/

import {
  AddAddressesParams,
  ContextPlugin,
  DaoAction,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const client: MultisigClient = new MultisigClient(contextPlugin);

// The addresses to add as members.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const addAddressesParams: AddAddressesParams = {
  members,
  pluginAddress: "0x0987654321098765432109876543210987654321" // the address of the Multisig plugin contract installed in the DAO
};

// Adds the addresses as members of the Multisig plugin for a DAO.
const addAddressesToMultisig: DaoAction = client.encoding.addAddressesAction(addAddressesParams);
console.log({ addAddressesToMultisig });

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
