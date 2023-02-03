/* MARKDOWN
### Approve a multisig proposal

A member of a multisig plugin is able to approve a proposal and give their approval for the transaction to go through
*/

import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  Context,
  ContextPlugin,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const multisigClient = new MultisigClient(contextPlugin);

const approveParams: ApproveMultisigProposalParams = {
  proposalId: BigInt(0),
  pluginAddress: "0x1234567890123456789012345678901234567890",
  tryExecution: true
};

const steps = multisigClient.methods.approveProposal(approveParams);
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
