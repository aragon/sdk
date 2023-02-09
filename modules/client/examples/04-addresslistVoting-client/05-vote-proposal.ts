/* MARKDOWN
### Voting on a Addresslist proposal

This example shows how to vote on a proposal using the Addresslist Voting plugin.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  IVoteProposalParams,
  VoteProposalStep,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Create a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an Addresslist client to use the Addresslist plugin.
const client = new AddresslistVotingClient(contextPlugin);

const voteParams: IVoteProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890",
  vote: VoteValues.YES
};

// Vote on an Addresslist proposal.
const steps = client.methods.voteProposal(voteParams);
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
    console.error({ err });
  }
}
