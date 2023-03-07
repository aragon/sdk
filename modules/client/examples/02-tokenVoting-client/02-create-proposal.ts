/* MARKDOWN
### Create a TokenVoting proposal

In order to use the Token Voting governance mechanism within your DAO, you'll want to ensure your DAO has the TokenVoting plugin installed.
Then, you can create proposals using the `createProposal` method in your `TokenVotingClient`.
*/

import {
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  DaoAction,
  ProposalCreationSteps,
  ProposalMetadata,
  TokenVotingClient,
  VotingMode,
  VotingSettings,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const metadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/..."
    },
    {
      name: "Website",
      url: "https://website..."
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  },
};

// Pin the metadata in IPFS to get back the URI.
const metadataUri: string = await tokenVotingClient.methods.pinMetadata(metadata);

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the plugin contract containing all plugin logic.

// [Optional] In case you wanted to pass an action to the proposal, you can configure it here and pass it immediately. An action is the encoded transaction which will get executed when a proposal passes.
// In this example, we are creating an action to change the settings of a governance plugin to demonstrate how to set it up.
const configActionParams: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.EARLY_EXECUTION, // default STANDARD, other options: EARLY_EXECUTION, VOTE_REPLACEMENT
};
// We need to encode the action so it can executed once the proposal passes.
const updatePluginSettingsAction: DaoAction = tokenVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionParams);

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress,
  metadataUri,
  actions: [updatePluginSettingsAction], // this is optional. if you don't want to pass any actions, simply pass an empty array `[]`.
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES // default NO, other options: ABSTAIN, YES. This saves gas for the voting transaction.
};

// Create a proposal where members participate through token voting.
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
