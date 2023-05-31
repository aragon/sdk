/* MARKDOWN
---
title: Create Proposal
---

## Create an Addresslist Voting Proposal

Creates a proposal for a DAO with the Addresslist Voting plugin installed.
Within this proposal, only addresses in the approved list of the Addresslist Voting plugin can vote.
*/

import {
  AddresslistVotingClient,
  CreateMajorityVotingProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  VoteValues,
} from "@aragon/sdk-client";
import { context } from "../index";

// Create a plugin context from the Aragon OSx SDK context.

// Create an AddresslistVoting client.
const addresslistVotingClient = new AddresslistVotingClient(context);

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

const metadataUri: string = await addresslistVotingClient.methods.pinMetadata(
  metadata,
);

const pluginAddress = "0x1234567890123456789012345678901234567890"; // the address of the AddresslistVoting plugin installed into the DAO.

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress,
  metadataUri,
  actions: [],
  failSafeActions: [],
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
