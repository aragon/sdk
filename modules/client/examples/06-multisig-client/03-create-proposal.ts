/* MARKDOWN
### Creating a multisig proposal
*/
import {
  Client,
  Context,
  ContextPlugin,
  MultisigClient,
  ProposalCreationSteps,
  ProposalMetadata,
  CreateMultisigProposalParams,
  IWithdrawParams,
} from "@aragon/sdk-client";
import { CreateMultisigProposalParams, WithdrawParams } from "../../src";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a multisig client
const client: Client = new Client(context);
// Create a multisig client
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

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

const ipfsUri = await multisigClient.methods.pinMetadata(metadata);
const withdrawParams: WithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test",
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const withdrawAction = await client.encoding.withdrawAction(
  daoAddress,
  withdrawParams,
);

const proposalParams: CreateMultisigProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri: ipfsUri,
  actions: [withdrawAction],
  failSafeActions: [false], // the action cannot fail gracefully
  startDate: new Date(),
  endDate: new Date(),
};

const steps = multisigClient.methods.createProposal(proposalParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case ProposalCreationSteps.DONE:
        console.log(step.proposalId);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
