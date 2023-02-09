/* MARKDOWN
### Approve a multisig proposal

A member of a Multisig plugin is an address that is able to give their approval for a transaction to go through.
*/

import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Insantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client
const multisigClient = new MultisigClient(contextPlugin);

const approveParams: ApproveMultisigProposalParams = {
  proposalId: BigInt(0),
  pluginAddress: "0x1234567890123456789012345678901234567890", // the address of the plugin contract itself.
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
    console.error({ err });
  }
}
