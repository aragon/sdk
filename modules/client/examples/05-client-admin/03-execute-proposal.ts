/* MARKDOWN
### Creating and executing an admin proposal right away

*/
import {
  Client,
  ClientAdmin,
  Context,
  ContextPlugin,
  ExecuteProposalParams,
  ExecuteProposalStep,
  IWithdrawParams,
  ProposalCreationSteps,
  ProposalMetadata,
  VoteValues,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const clientAdmin = new ClientAdmin(contextPlugin);
const client = new Client(context);

const metadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/...",
    },
    {
      name: "Website",
      url: "https://website...",
    },
  ],
  media: {
    logo: "https://...",
    header: "https://...",
  },
};

const ipfsUri = await clientAdmin.methods.pinMetadata(metadata);

const withdrawParams: IWithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(5),
};
const withdrawAction = await client.encoding.withdrawAction(
  "0x0987654321098765432109876543210987654321",
  withdrawParams,
);

const proposalParams: ExecuteProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri: ipfsUri,
  actions: [withdrawAction],
};

const steps = clientAdmin.methods.executeProposal(proposalParams);
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
