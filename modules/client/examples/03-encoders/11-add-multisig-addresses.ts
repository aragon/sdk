/* MARKDOWN
### Add Members to a Multisig Plugin

Adds a new address as a member of the Multisig plugin installed in a DAO.
*/

import {
  Context,
  ContextPlugin,
  MultisigClient,
  AddAddressesParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Creates a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Creates a Multisig client.
const client: MultisigClient = new MultisigClient(contextPlugin);

// The addresses to add as members.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const addAddressesParams: AddAddressesParams = {
  members,
  pluginAddress: "0x0987654321098765432109876543210987654321" // The address of the Multisig plugin.
};

// Adds the addresses as members of the Multisig plugin for a DAO.
const addAddressesToMultisig = client.encoding.addAddressesAction(addAddressesParams);
console.log({ addAddressesToMultisig });

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
