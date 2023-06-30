/* MARKDOWN
---
title: Get Proposals
---

## Get All Token Voting Proposals That Have Been Created

Gets all proposals from a DAO that are created using the TokenVoting plugin as its governance mechanism.
*/

import {
  ProposalQueryParams,
  ProposalSortBy,
  TokenVotingClient,
  TokenVotingProposalListItem,
} from "@aragon/sdk-client";
import { ProposalStatus, SortDirection } from "@aragon/sdk-client-common";
import { context } from "../index";

// Create a plugin context from the Aragon SDK.

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

const queryParams: ProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional
  direction: SortDirection.ASC, // optional, otherwise DESC ("descending")
  sortBy: ProposalSortBy.CREATED_AT, // optional, otherwise NAME, VOTES (POPULARITY coming soon)
  status: ProposalStatus.ACTIVE, // optional, otherwise PENDING, SUCCEEDED, EXECUTED, DEFEATED
};

const tokenVotingProposals: TokenVotingProposalListItem[] =
  await tokenVotingClient.methods.getProposals(queryParams);
console.log(tokenVotingProposals);

/* MARKDOWN
Returns:

```
[
  {
    id: "0x12345...",
    dao: {
      address: "0x1234567890123456789012345678901234567890",
      name: "Cool DAO"
    },
    creatorAddress: "0x1234567890123456789012345678901234567890",
    metadata: {
      title: "Test Proposal",
      summary: "Test Proposal Summary"
    },
    startDate: <Date>,
    endDate: <Date>,
    status: "Executed",
    token: {
      address: "0x1234567890123456789012345678901234567890,
      name: "The Token",
      symbol: "TOK",
      decimals: 18
    },
    results {
      yes: 100000n,
      no: 77777n,
      abstain: 0n
    }
  },
  {
    id: "0x12345...",
    dao: {
      address: "0x1234567890123456789012345678901234567890",
      name: "Cool DAO"
    },
    creatorAddress: "0x1234567890123456789012345678901234567890",
    metadata: {
      title: "Test Proposal 2",
      summary: "Test Proposal Summary 2"
    },
    startDate: <Date>,
    endDate: <Date>,
    status: "Pending",
    token: {
      address: "0x1234567890123456789012345678901234567890,
      name: "The Token",
      symbol: "TOK",
      decimals: 18
    },
    results {
      yes: 100000n,
      no: 77777n,
      abstain: 0n
    }
  }
]
```
*/
