/* MARKDOWN
### Execute the actions of a Multisig proposal

Executes the actions set within a proposal made using the Multisig plugin.
*/

import {
  ContextPlugin,
  ExecuteProposalStep,
  MultisigClient
} from "@aragon/sdk-client";
import { context } from "../01-client/index";

// Insantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Insantiate a Multisig client.
const multisigClient = new MultisigClient(contextPlugin);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0"

// Executes the actions of a Multisig proposal.
const steps = multisigClient.methods.executeProposal(proposalId);

for await (const step of steps) {
  try {
    switch (step.key) {
      case ExecuteProposalStep.EXECUTING:
        console.log(step.txHash);
        break;
      case ExecuteProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
