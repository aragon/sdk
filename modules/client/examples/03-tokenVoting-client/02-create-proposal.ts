/* MARKDOWN
---
title: Create Proposal
---

## Create a Token Voting Proposal

In order to use the Token Voting governance mechanism within your DAO, you'll want to ensure your DAO has the TokenVoting plugin installed.
Then, you can create proposals using the `createProposal` method in your `TokenVotingClient`.
*/

import {
  ContextPlugin,
  CreateMajorityVotingProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  TokenVotingClient,
  VoteValues,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  contextPlugin,
);

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

// Pin the metadata in IPFS to get back the URI.
const metadataUri: string = await tokenVotingClient.methods.pinMetadata(
  metadata,
);

const pluginAddress: string = "0x1234567890123456789012345678901234567890"; // the address of the plugin contract containing all plugin logic.

const proposalParams: CreateMajorityVotingProposalParams = {
  pluginAddress,
  metadataUri,
  actions: [],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES, // default NO, other options: ABSTAIN, YES. This saves gas for the voting transaction.
};

// Create a proposal where members participate through token voting.
const steps = tokenVotingClient.methods.createProposal(proposalParams);

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
