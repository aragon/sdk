/* MARKDOWN
### Get a proposal by proposalID (TokenVoting)

Gets a specific proposal using the TokenVoting plugin as its governance mechanism.
*/

import {
  ContextPlugin,
  TokenVotingClient,
  TokenVotingProposal
} from "@aragon/sdk-client";
import { context } from "../01-client/index";

// Instantiate a plugin context from an Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// The address of the proposal you want to retrieve.
const proposalId: string = "0x1234567890123456789012345678901234567890_0x0";

// Get a specific proposal created using the TokenVoting plugin.
const proposal: TokenVotingProposal | null = await tokenVotingClient.methods.getProposal(proposalId);
console.log({ proposal });

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
        "name: "Document"
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
  result {
    yes: 700000n,
    no: 300000n,
    abstain: 0n
  }
  settings:{
    minParticipation: 0.5,
    supportThreshold: 0.25,
    minDuration: 7200
  },
  token: {
    address: "0x1234567890123456789012345678901234567890,
    name: "The Token",
    symbol: "TOK",
    decimals: 18
  },
  usedVotingWeight: 1000000n,
  votes: [
    {
      address: "0x123456789123456789123456789123456789",
      vote: 2, // VoteValues.YES
      voteWeight: 700000n
    },
    {
      address: "0x234567891234567891234567891234567890",
      vote: 3, // VoteValues.NO
      voteWeight: 300000n
    }
  ]
  status: "Executed"
}
```
*/
