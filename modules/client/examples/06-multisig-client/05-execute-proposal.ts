/* MARKDOWN
### Approve a multisig proposal
*/
import {
  Context,
  ContextPlugin,
  ExecuteProposalStep,
  MultisigClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an multisig client
const client = new MultisigClient(contextPlugin);

const steps = client.methods.executeProposal(
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
