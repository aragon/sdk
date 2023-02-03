/* MARKDOWN
### Remove members from the Multisig plugin

Removes a list of addresses from the Multisig plugin of a given DAO
*/

import {
  Context,
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { RemoveAddressesParams } from "../../src";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a Multisig client.
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
const removeAddressesFromMultisig = multisigClient.encoding.removeAddressesAction(removeAddressesParams);
console.log(removeAddressesFromMultisig);

/*
Returns:
```json
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```
*/
