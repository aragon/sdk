/* MARKDOWN
### Create a TokenVoting proposal

Create a proposal using the TokenVoting plugin.
This proposal will be created using the TokenVoting plugin as its governance mechanism.
*/

import {
  ContextPlugin,
  ICreateProposalParams,
  ProposalCreationSteps,
  TokenVotingClient,
  VotingMode,
  VotingSettings,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// Create a config action to set the parameters of how the proposal should be initiated.
const configActionParams: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.EARLY_EXECUTION // default standard, other options: EARLY_EXECUTION, VOTE_REPLACEMENT
};

// The contract address of the token voting plugin you have installed in your DAO
const pluginAddress: string = "0x1234567890123456789012345678901234567890";

// Update the configuration of the plugin.
const configAction = tokenVotingClient.encoding.updatePluginSettingsAction(
  configActionParams,
  pluginAddress
);

const metadataUri: string = await tokenVotingClient.methods.pinMetadata({
  title: "Test proposal",
    summary: "This is a test proposal",
    description: "This is the description of a long test proposal",
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
  pluginAddress: "0x1234567890123456789012345678901234567890", // the address of the TokenVoting plugin contract containing all plugin logic.
  metadataUri,
  actions: [configAction], // optional, if none, leave an empty array `[]`
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES // default NO, other options: ABSTAIN, YES
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
    console.error({ err });
  }
}
