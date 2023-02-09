/* MARKDOWN
### Create a AddresslistVoting proposal

Creates a proposal for a DAO with the AddresslistVoting plugin installed. Within this proposal, only addresses in the approved list of the AddresslistVoting plugin can vote.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  ICreateProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Create a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddresslistVoting client.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

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

const ipfsUri = await addresslistVotingClient.methods.pinMetadata(metadata);

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri: ipfsUri,
  actions: [], // actions to happen after a proposal is approved
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES // otherwise NO or ABSTAIN
};

const steps = addresslistVotingClient.methods.createProposal(proposalParams);
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
