/* MARKDOWN
### Creating a TokenVoting proposal with an action

Add the actions you want fulfilled when a TokenVoting proposal passes within the proposal parameters.
*/

import {
  Context,
  ContextPlugin,
  ICreateProposalParams,
  ProposalCreationSteps,
  TokenVotingClient,
  VoteValues,
  VotingMode,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context.
const context: Context = new Context(contextParams);
// Create a plugin context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// Create a config action
const configActionParams: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.EARLY_EXECUTION, // default standard
};

// The contract address of the token voting plugin you have installed in your DAO
const pluginAddress: string = "0x1234567890123456789012345678901234567890";

// The action you want the plugin to have when creating the proposal.
const configAction = tokenVotingClient.encoding.updatePluginSettingsAction(
  pluginAddress,
  configActionParams,
);

const metadataUri = await tokenVotingClient.methods.pinMetadata({
  title: "Test proposal",
    summary: "This is a test proposal",
    description: "his is a test proposal, but longer",
    resources: [
      {
        url: "https://thforumurl.com",
        name: "Forum"
      }
    ],
    media: {
      header: "https://fileserver.com/header.png",
      logo: "https://fileserver.com/logo.png"
    }
})

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri,
  actions: [configAction],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES,
};

// Creates a proposal using the token voting governance mechanism, which executes the actions set in the configAction object.
const steps = tokenVotingClient.methods.createProposal(proposalParams);
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
