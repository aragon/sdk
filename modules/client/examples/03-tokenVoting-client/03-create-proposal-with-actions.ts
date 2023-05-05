/* MARKDOWN
---
title: Create Proposal with Action
---

## Create a Token Voting Proposal with Actions

Create a proposal with an action using the TokenVoting plugin as its governance mechanism.
An action is the encoded transaction which will get executed when a proposal passes.
*/

import {
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  DaoAction,
  ProposalCreationSteps,
  TokenVotingClient,
  VoteValues,
  VotingMode,
  VotingSettings,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  contextPlugin,
);

// The contract address of the token voting plugin you have installed in your DAO
const pluginAddress: string = "0x1234567890123456789012345678901234567890";

// Update
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
const updatePluginSettingsAction: DaoAction = tokenVotingClient.encoding
  .updatePluginSettingsAction(pluginAddress, configActionParams);

const metadataUri: string = await tokenVotingClient.methods.pinMetadata({
  title: "Test proposal",
  summary: "This is a test proposal",
  description: "This is the description of a long test proposal",
  resources: [
    {
      url: "https://thforumurl.com",
      name: "Forum",
    },
  ],
  media: {
    header: "https://fileserver.com/header.png",
    logo: "https://fileserver.com/logo.png",
  },
});

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890", // the address of the TokenVoting plugin contract containing all plugin logic.
  metadataUri,
  actions: [updatePluginSettingsAction], // optional, if none, leave an empty array `[]`
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES, // default NO, other options: ABSTAIN, YES
};

// Creates a proposal using the token voting governance mechanism, which executes with the parameters set in the configAction object.
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
