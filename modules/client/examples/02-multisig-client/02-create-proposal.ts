/* MARKDOWN
---
title: Create a Proposal
---

## Create a Multisig Proposal

Creates a proposal whose governance mechanism is the Multisig plugin and its defined configuration.
*/

import {
  Client,
  ContextPlugin,
  CreateMultisigProposalParams,
  MultisigClient,
  ProposalCreationSteps,
  ProposalMetadata,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Insantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const proposalMetadata: ProposalMetadata = {
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

// Pins the metadata to IPFS and gets back an IPFS URI.
const metadataUri: string = await multisigClient.methods.pinMetadata(
  proposalMetadata,
);

const proposalParams: CreateMultisigProposalParams = {
  pluginAddress: "0x1234567890123456789012345678901234567890",
  metadataUri,
  actions: [], // optional - if left as an empty array, no action will be set for the proposal. the action needs to be encoded and will be executed once a proposal passes.
};

// Generates a proposal with the withdraw action as passed in the proposalParams.
const steps = multisigClient.methods.createProposal(proposalParams);

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
