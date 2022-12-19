/* MARKDOWN
### Retrieve a proposal by proposalID (Token)

Retrieving the proposals of an Token DAO.
*/
import {
  ClientToken,
  Context,
  ContextPlugin,
  TokenProposal,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an Token client
const client = new ClientToken(contextPlugin);

const proposalId = "0x12345...";

const proposal: TokenProposal | null = await client.methods.getProposal(
  proposalId,
);
console.log(proposal);
/*
{
  id: "0x12345...",
  dao: {
    address: "0x1234567890123456789012345678901234567890",
    name: "Cool DAO"
  };
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
  };
  startDate: <Date>,
  endDate: <Date>,
  creationDate: <Date>,
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
    minTurnout: 0.5,
    minSupport: 0.25,
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
      voteWeight: 700000n,
    },
    {
      address: "0x234567891234567891234567891234567890",
      vote: 3, // VoteValues.NO
      voteWeight: 300000n,
    }
  ]
  status: "Executed",
}
*/
