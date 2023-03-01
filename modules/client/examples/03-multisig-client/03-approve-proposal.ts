/* MARKDOWN
### Approve a multisig proposal

A member of a Multisig plugin is an address that is able to give their approval for a transaction to go through.
This function enables Multisig members to approve a proposal.
*/

import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  ContextPlugin,
  MultisigClient
} from "@aragon/sdk-client";
<<<<<<<< HEAD:modules/client/examples/03-multisig-client/04-approve-proposal.ts
import { context } from "../01-setup/01-getting-started";
========
import { context } from "../00-setup/00-getting-started";
>>>>>>>> ff7d28f52b53e70c70ca11662e9a2e8d2c35b827:modules/client/examples/03-multisig-client/03-approve-proposal.ts

// Insantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client
const multisigClient = new MultisigClient(contextPlugin);

const approveParams: ApproveMultisigProposalParams = {
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
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
