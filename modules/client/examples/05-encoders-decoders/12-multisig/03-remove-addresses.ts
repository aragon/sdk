/* MARKDOWN
---
title: Remove Members
---

## Remove Members from the Multisig Plugin

Removes a list of addresses from the Multisig plugin of a given DAO so they are no longer able to vote on Multisig proposals for that DAO.

## Caveats

This action is usually paired with `updatePluginSettingsAction` to update the minimum approvals required for a multisig proposal to pass.
In the case of removing addresses the order in which you execute actions matter, so if you are removing members and updating the plugin setting make sure that the order of the actions is first the `updatePluginSettingsAction` and then the `removeAddressesAction`.
If this is not done correctly the transaction may fail and in the worst case brick the DAO.

### Encoding
*/

import { RemoveAddressesParams } from "@aragon/sdk-client";
import { DaoAction } from "@aragon/sdk-client-common";
import { multisigClient } from "./index";

// List of members to remove from the multisig plugin.
const members: string[] = [
  "0x1357924680135792468013579246801357924680",
  "0x2468013579246801357924680135792468013579",
  "0x0987654321098765432109876543210987654321",
];

const removeAddressesParams: RemoveAddressesParams = {
  members,
  pluginAddress: "0x0987654321098765432109876543210987654321", // the address of the Multisig plugin contract installed in the DAO
};

// Removes the addresses from the Multisig plugin of a DAO.
const action: DaoAction = multisigClient.encoding.removeAddressesAction(
  removeAddressesParams,
);
console.log({ action });

/* MARKDOWN
Returns:

```
{ action:
  {
    to: "0x1234567890...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
}
```

### Decoding
*/

// Decodes the parameters of the remove members action from the Multisig plugin.
const decodedParams: string[] = multisigClient.decoding.removeAddressesAction(
  action.data,
);
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
