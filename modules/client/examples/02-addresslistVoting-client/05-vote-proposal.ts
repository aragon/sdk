/* MARKDOWN
### Voting on a address list proposal
*/
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  IVoteProposalParams,
  VoteProposalStep,
  VoteValues,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new AddresslistVotingClient(contextPlugin);

const voteParams: IVoteProposalParams = {
  proposalId:
    "0x1234567890123456789012345678901234567890_0x0000000000000000000000000000000000000000000000000000000000000000",
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
