/* MARKDOWN
---
title: Get Proposal
---

## Get a Addresslist Voting Proposal by Its ID

Gets a proposal created using the Addresslist Voting plugin.
*/

import {
  AddresslistVotingClient,
  AddresslistVotingProposal,
  ContextPlugin,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddresslistVoting client.
const addresslistVotingClient: AddresslistVotingClient =
  new AddresslistVotingClient(contextPlugin);

const proposalId: string = "0x1234567890123456789012345678901234567890_0x0";

const addresslistVotingProposal: AddresslistVotingProposal | null =
  await addresslistVotingClient.methods.getProposal(proposalId);
console.log(addresslistVotingProposal);

/* MARKDOWN
Returns:

```
{
  id: "0x1234567890123456789012345678901234567890_0x0",
  dao: {
    address: "0x1234567890123456789012345678901234567890",
    name: "Cool DAO"
  },
  creatorAddress: "0x1234567890123456789012345678901234567890",
  metadata: {
    title: "Test Proposal",
    summary: "test proposal summary",
    description: "this is a long description",
    resources: [
      {
        url: "https://dicord.com/...",
        name: "Discord"
      },
      {
        url: "https://docs.com/...",
        name: "Document"
      }
    ],
    media: {
      header: "https://.../image.jpeg",
      logo: "https://.../image.jpeg"
    }
  },
  startDate: <Date>,
  endDate: <Date>,
  creationDate: <Date>,
  creationBlockNumber: 812345,
  executionDate: <Date>,
  executionBlockNumber: 812345,
  actions: [
    {
      to: "0x12345..."
      value: 10n
      data: [12,13,154...]
    }
  ],
  status: "Executed",
  result {
    yes: 1,
    no: 1,
    abstain: 0
  }
  settings: {
    minParticipation: 0.5,
    supportThreshold: 0.25,
    minDuration: 7200
  },
  votes: [
    {
      address: "0x123456789123456789123456789123456789",
      vote: 2 // VoteValues.YES
    },
    {
      address: "0x234567891234567891234567891234567890",
      vote: 3 // VoteValues.NO
    }
  ]
}
```
*/
