/* MARKDOWN
---
title: Add Members
---

## Add Members from the Multisig Plugin

Adds new address as members of the Multisig plugin installed in a DAO, so they are now able to vote on proposals.

## Caveats

This action is usually paired with `updatePluginSettingsAction` to update the minimum approvals required for a multisig proposal to pass.
In the case of adding addresses the order in which you execute actions matter, so if you are adding members and updating the plugin setting make sure that the order of the actions is first the `addAddressesAction` and then the `updatePluginSettingsAction`.
If this is not done correctly the transaction may fail and in the worst case brick the DAO. 

### Encoding
*/

import {
  AddAddressesParams,
  DaoAction,
} from "@aragon/sdk-client";
import { multisigClient } from "./index";

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
const action: DaoAction = multisigClient.encoding.addAddressesAction(addAddressesParams);
console.log({ action });

/* MARKDOWN
Returns:

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

### Decoding
*/

const decodedParams: string[] = multisigClient.decoding.addAddressesAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```
{ decodedParams:
  [
    "0x12345...",
    "0x56789...",
    "0x13579..."
  ]
}
```
*/
