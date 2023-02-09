/* MARKDOWN
### Create a TokenVoting proposal

In order to use the Token Voting governance mechanism within your DAO, you'll want to ensure your DAO has the TokenVoting plugin installed.
Then, you can create proposals using the `createProposal` method in your `TokenVotingClient`.
*/

import {
  ContextPlugin,
  ICreateProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  TokenVotingClient,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient = new TokenVotingClient(contextPlugin);

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
const metadataUri = await tokenVotingClient.methods.pinMetadata(metadata);

const proposalParams: ICreateProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri,
  actions: [],
  startDate: new Date(),
  endDate: new Date(),
  executeOnPass: false,
  creatorVote: VoteValues.YES // default NO, other options: ABSTAIN, YES
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
    console.error({ err });
  }
}
