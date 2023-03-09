/* MARKDOWN
---
title: Add Members
---

## Add Members from the Multisig Plugin

Adds new address as members of the Multisig plugin installed in a DAO, so they are now able to vote on proposals.
*/

import {
  AddAddressesParams,
  ContextPlugin,
  DaoAction,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../index";

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

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```
*/


/* MARKDOWN
---
title: Add Members
---

## Decode Add Members Action (Multisig)

Decodes the parameters of the add members action from the Multisig plugin.
*/

import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const decodeAddMembersMultisig: string[] = multisigClient.decoding.addAddressesAction(data);
console.log({ decodeAddMembersMultisig });

/* MARKDOWN
Returns:

```
{ decodeAddMembersMultisig:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```
*/
