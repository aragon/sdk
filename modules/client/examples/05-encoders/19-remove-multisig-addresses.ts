/* MARKDOWN
---
title: Remove Members
---

## Remove Members from the Multisig Plugin

Removes a list of addresses from the Multisig plugin of a given DAO so they are no longer able to vote on Multisig proposals for that DAO.
*/

import {
  ContextPlugin,
  DaoAction,
  MultisigClient,
  RemoveAddressesParams
} from "@aragon/sdk-client";
import { context } from "../index";

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
title: Remove Members
---

## Decode Remove Members Action (Multisig)

Decodes the parameters of the remove members action from the Multisig plugin.
*/

import {
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of the remove members action from the Multisig plugin.
const decodeRemoveMemberMultisig: string[] = multisigClient.decoding.removeAddressesAction(data);
console.log({ decodeRemoveMemberMultisig });

/* MARKDOWN
Returns:

```
{ decodeRemoveMemberMultisig:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```
*/
