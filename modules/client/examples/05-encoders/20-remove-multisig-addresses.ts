/* MARKDOWN
#### Remove members (Multisig plugin)

Removes a list of addresses from the Multisig plugin of a given DAO so they are no longer able to vote on Multisig proposals for that DAO.
*/

import {
  ContextPlugin,
  DaoAction,
  MultisigClient,
  RemoveAddressesParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

// List of members to remove from the multisig plugin.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const removeAddressesParams: RemoveAddressesParams = {
  members,
  pluginAddress: "0x0987654321098765432109876543210987654321" // the address of the Multisig plugin contract installed in the DAO
};

// Removes the addresses from the Multisig plugin of a DAO.
const removeAddressesFromMultisig: DaoAction = multisigClient.encoding.removeAddressesAction(removeAddressesParams);
console.log(removeAddressesFromMultisig);

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
