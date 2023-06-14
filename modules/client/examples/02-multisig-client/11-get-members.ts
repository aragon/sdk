/* MARKDOWN
---
title: Get Members
---

## Get DAO Members Introduced by the Multisig Plugin

Gets the list of addresses able to participate in a Multisig proposal for a given DAO that has the Multisig plugin installed.
*/

import { MultisigClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(context);

const daoPluginAddress: string = "0x1234548357023847502348"; // The address of the plugin that DAO has installed. You can find this through calling `getDao(daoAddress)` and getting the DAO details .

const multisigMembers: string[] = await multisigClient.methods.getMembers(
  daoPluginAddress,
);
console.log(multisigMembers);

/* MARKDOWN
Returns:

```
[
  "0x1234567890...",
  "0x2345678901...",
  "0x3456789012..."
]
```
*/
