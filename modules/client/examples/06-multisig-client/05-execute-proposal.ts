/* MARKDOWN
### Executes the actions of a Multisig proposal

Executes the actions set within a proposal made using the Multisig plugin.
*/

import {
  Context,
  ContextPlugin,
  ExecuteProposalStep,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a Multisig client
const multisigClient = new MultisigClient(contextPlugin);

// Executes the actions of a Multisig proposal.
const steps = multisigClient.methods.executeProposal(
  {
    pluginAddress: "0x1234567890123456789012345678901234567890",
    proposalId: BigInt(0)
  }
);
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
