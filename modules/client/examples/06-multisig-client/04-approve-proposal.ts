/* MARKDOWN
### Approve a multisig proposal
*/
import {
  Context,
  ContextPlugin,
  MultisigClient,
  ApproveProposalSteps,
} from "@aragon/sdk-client";
import { ApproveMultisigProposalParams } from "../../src";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const voteParams: ApproveMultisigProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890",
};

const steps = client.methods.approveProposal(voteParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ApproveProposalSteps.APPROVING:
        console.log(step.txHash);
        break;
      case ApproveProposalSteps.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
