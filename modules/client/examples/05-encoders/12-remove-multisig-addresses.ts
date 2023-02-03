/* MARKDOWN
### Remove members (Multisig plugin)

Removes a list of addresses from the Multisig plugin of a given DAO
*/

import {
  Context,
  ContextPlugin,
  DaoAction,
  MultisigClient
} from "@aragon/sdk-client";
import { RemoveAddressesParams } from "../../src";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
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
  pluginAddress: "0x0987654321098765432109876543210987654321",
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
