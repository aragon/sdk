/* MARKDOWN
---
title: Execute Proposal
---

## Execute a TokenVoting Proposal

Executes the actions set within a proposal made using the TokenVoting plugin.
*/

import { ExecuteProposalStep, TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Insantiate a plugin context from the Aragon OSx SDK context.

// Insantiate a TokenVoting client.
const tokenVotingClient = new TokenVotingClient(context);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0";

// Executes the actions of a TokenVoting proposal.
const steps = tokenVotingClient.methods.executeProposal(proposalId);

for await (const step of steps) {
  try {
    switch (step.key) {
      case ExecuteProposalStep.EXECUTING:
        console.log({ txHash: step.txHash });
        break;
      case ExecuteProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
/* MARKDOWN
Returns:
```tsx
{
  txHash: "0xb1c14a49...3e8620b0f5832d61c"
}
```
*/
