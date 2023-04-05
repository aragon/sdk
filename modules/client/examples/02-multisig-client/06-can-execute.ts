/* MARKDOWN
---
title: Check Execution
---

## Check if a User Can Execute an Proposal

Checks whether the signer of the transaction is able to execute actions approved and created by proposals from the Multisig plugin.
*/

import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0";

// Checks whether the signer of the transaction can execute a given proposal.
const canExecute = await multisigClient.methods.canExecute(proposalId);
console.log(canExecute);

/* MARKDOWN
Returns:

```
true
```
*/
