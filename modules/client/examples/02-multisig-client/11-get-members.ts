/* MARKDOWN
---
title: Get Members
---

## Get DAO Members Introduced by the Multisig Plugin

Gets the list of addresses able to participate in a Multisig proposal for a given DAO that has the Multisig plugin installed.
*/

import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const daoAddressorEns: string = "0x1234548357023847502348"; // or my-dao.dao.eth

const multisigMembers: string[] = await multisigClient.methods.getMembers(
  daoAddressorEns,
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
