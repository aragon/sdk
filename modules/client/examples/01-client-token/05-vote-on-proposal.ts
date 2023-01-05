/* MARKDOWN
### Voting on a TokenVoting proposal
*/
import {
  Context,
  ContextPlugin,
  IVoteProposalParams,
  TokenVotingClient,
  VoteProposalStep,
  VoteValues,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const client = new TokenVotingClient(contextPlugin);

const voteParams: IVoteProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890",
  vote: VoteValues.YES,
};

const steps = client.methods.voteProposal(voteParams);
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
