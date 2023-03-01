/* MARKDOWN
### Create a AddresslistVoting proposal

Creates a proposal for a DAO with the AddresslistVoting plugin installed.
Within this proposal, only addresses in the approved list of the AddresslistVoting plugin can vote.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  VotingSettings,
  VotingMode,
  VoteValues
} from "@aragon/sdk-client";
<<<<<<<< HEAD:modules/client/examples/04-addresslistVoting-client/04-create-proposal.ts
import { context } from "../01-client/01-getting-started";
========
import { context } from "../00-setup/00-getting-started";
>>>>>>>> ff7d28f52b53e70c70ca11662e9a2e8d2c35b827:modules/client/examples/04-addresslistVoting-client/03-create-proposal.ts

// Create a plugin context from the Aragon OSx SDK context.
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

const metadataUri: string = await addresslistVotingClient.methods.pinMetadata(metadata);

const pluginAddress = "0x1234567890123456789012345678901234567890"; // the address of the AddresslistVoting plugin installed into the DAO.

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress,
  metadataUri,
  actions: [],
  failSafeActions: [],
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
    console.error(err);
  }
}
