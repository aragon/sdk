/* MARKDOWN
---
title: Proposal Actions
---

## Create a Token Voting Proposal with Actions

Creates a proposal with an action(s) to get executed upon the proposal passes. Within this proposal, only addresses in the approved list of the AddresslistVoting plugin can vote.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  MajorityVotingSettings,
  ProposalCreationSteps,
  ProposalMetadata,
  VoteValues,
  VotingMode,
} from "@aragon/sdk-client";
import { context } from "../index";

// Create a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddresslistVoting client from the Aragon OSx SDK context.
const addresslistVotingClient: AddresslistVotingClient =
  new AddresslistVotingClient(contextPlugin);

// [Optional] You can add encoded actions to the proposal. These actions are the encoded transactions which will be executed when a transaction passes.
// In this example, we are updating the plugin settings as an action that you may want upon a proposal approval.
const updatePluginSettingsParams: MajorityVotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.EARLY_EXECUTION, // alternatively, STANDARD or VOTE_REPLACEMENT
};

const pluginAddress = "0x1234567890123456789012345678901234567890"; // the address of the plugin contract itself

// Sets up the action instructions based on the above parameters.
const updatePluginSettingsAction = addresslistVotingClient.encoding
  .updatePluginSettingsAction(
    pluginAddress,
    updatePluginSettingsParams,
  );

const daoMetadata: ProposalMetadata = {
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
};

const metadataUri: string = await addresslistVotingClient.methods.pinMetadata(
  daoMetadata,
);

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890", // the address of the AddresslistVoting plugin contract installed in the DAO
  metadataUri,
  actions: [updatePluginSettingsAction], // the action you want to have executed upon a proposal approval
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES, // otherwise NO or ABSTAIN
};

const steps = addresslistVotingClient.methods.createProposal(proposalParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case ProposalCreationSteps.CREATING:
        console.log({ txHash: step.txHash });
        break;
      case ProposalCreationSteps.DONE:
        console.log({ proposalId: step.proposalId });
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
/* MARKDOWN
Returns:
```tsx
{ 
  txHash: "0xb1c14a49...3e8620b0f5832d61c"
}
{
  proposalId: "0xb1c14a49...3e862_0x0",
}
```
*/
