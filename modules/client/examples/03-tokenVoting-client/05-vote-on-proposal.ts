/* MARKDOWN
---
title: Vote
---

## Vote on a Token Voting Proposal

Adds a vote to a proposal using the TokenVoting governance mechanism.
The amount of votes submitted depends on the amount of tokens the signer address has.
*/

import {
  TokenVotingClient,
  VoteProposalParams,
  VoteProposalStep,
  VoteValues,
} from "@aragon/sdk-client";
import { context } from "../index";

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

const voteParams: VoteProposalParams = {
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
  vote: VoteValues.YES, // alternatively NO, or ABSTAIN
};

// Creates a vote on a given proposal created by the token voting governance mechanism.
const steps = tokenVotingClient.methods.voteProposal(voteParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case VoteProposalStep.VOTING:
        console.log({ txHash: step.txHash });
        break;
      case VoteProposalStep.DONE:
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
