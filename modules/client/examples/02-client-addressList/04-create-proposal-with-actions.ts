/* MARKDOWN
### Creating a address list proposal with an action
*/
import {
  ClientAddressList,
  Context,
  ContextPlugin,
  ICreateProposalParams,
  VotingSettings,
  ProposalCreationSteps,
  VoteValues,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new ClientAddressList(contextPlugin);

// create config action
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24,
  supportThreshold: 0.3, // 30%
  minParticipation: 0.5, // 50%
};

const pluginAddress = "0x1234567890123456789012345678901234567890";

const configAction = client.encoding.updateVotingSettingsAction(
  pluginAddress,
  configActionPrarms,
);

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadata: {
    title: "Test Proposal",
    summary: "This is a short description",
    description: "This is a long descrioption",
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
  },
  actions: [configAction],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES,
};

const steps = client.methods.createProposal(proposalParams);
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
