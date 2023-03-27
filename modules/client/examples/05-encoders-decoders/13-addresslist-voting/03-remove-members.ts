/* MARKDOWN
---
title: Remove Members
---

## Remove Members from the Addresslist Voting Plugin

Removes an address from the Addresslist plugin so that this address is no longer able to vote in AddresslistVoting proposals.

### Encoding
*/

import { DaoAction } from "@aragon/sdk-client";
import { addresslistVotingClient } from "./index";

// Addresses to remove from the AddressList plugin.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321"
];

const pluginAddress: string = "0x0987654321098765432109876543210987654321"; // the address of the AddresslistVoting plugin contract installed in the DAO

const action: DaoAction = addresslistVotingClient.encoding.removeMembersAction(pluginAddress, members);
console.log({ action });

/* MARKDOWN
Returns:

```json
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

### Decoding
*/


const removedMembers: string[] = addresslistVotingClient.decoding.removeMembersAction(action.data);
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
