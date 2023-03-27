/* MARKDOWN
---
title: Vote
---

## Vote on a Token Voting Proposal

Adds a vote to a proposal using the TokenVoting governance mechanism.
The amount of votes submitted depends on the amount of tokens the signer address has.
*/

import {
  ContextPlugin,
  IVoteProposalParams,
  TokenVotingClient,
  VoteProposalStep,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const voteParams: IVoteProposalParams = {
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
  vote: VoteValues.YES // other options: NO, ABSTAIN
};

// Creates a vote on a given proposal created by the token voting governance mechanism.
const steps = tokenVotingClient.methods.voteProposal(voteParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case VoteProposalStep.VOTING:
        console.log(step.txHash);
        break;
      case VoteProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
