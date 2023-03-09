/* MARKDOWN
---
title: Remove Members
---

## Remove Members from the Addresslist Voting Plugin

Removes an address from the Addresslist plugin so that this address is no longer able to vote in AddresslistVoting proposals.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  DaoAction
} from "@aragon/sdk-client";
import { context } from "../index";

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


/* MARKDOWN
---
title: Remove Members
---

## Decode Remove Members Action (Addresslist)

Decodes the action of removing addresses from the AddresslistVoting plugin so they can no longer vote in AddresslistVoting proposals.
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../index";

// Insantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an Addresslist plugin client.
const clientAddressList = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const removedMembers: string[] = clientAddressList.decoding.removeMembersAction(data);
console.log({ removedMembers });

/* MARKDOWN
Returns:

```
{ removedMembers:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```
*/
