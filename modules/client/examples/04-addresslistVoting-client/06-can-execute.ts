/* MARKDOWN
---
title: Check Execution
---

## Check if a User Can Execute an Proposal

Checks whether the signer of the transaction is able to execute actions approved and created by proposals from the TokenVoting plugin.
*/

import { TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0";

// Checks whether the signer of the transaction can execute a given proposal.
const canExecute = await tokenVotingClient.methods.canExecute(proposalId);
console.log(canExecute);

/* MARKDOWN
Returns:

```
true
```
*/
