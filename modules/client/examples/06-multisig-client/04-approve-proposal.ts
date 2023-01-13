/* MARKDOWN
### Approve a multisig proposal
*/
import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  Context,
  ContextPlugin,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const approveParams: ApproveMultisigProposalParams = {
  proposalId: BigInt(0),
  pluginAddress: "0x1234567890123456789012345678901234567890",
  tryExecution: true,
};

const steps = client.methods.approveProposal(approveParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ApproveProposalStep.APPROVING:
        console.log(step.txHash);
        break;
      case ApproveProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
