/* MARKDOWN
---
title: Get Proposals
---

## Get All Addresslist Voting Proposals That Have Been Created

Gets the list of proposals created using the Addresslist Voting plugin.
*/

import {
  AddresslistVotingClient,
  AddresslistVotingProposalListItem,
  ProposalQueryParams,
  ProposalSortBy,
} from "@aragon/sdk-client";
import { ProposalStatus, SortDirection } from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiate an AddresslistVoting client.
const addresslistVotingClient: AddresslistVotingClient =
  new AddresslistVotingClient(context);

const queryParams: ProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.CREATED_AT, //optional, alternatively NAME, VOTES (POPULARITY coming soon)
  status: ProposalStatus.ACTIVE, // optional, alternatively PENDING, SUCCEEDED, EXECUTED, DEFEATED
};

const addresslistVotingProposals: AddresslistVotingProposalListItem[] =
  await addresslistVotingClient.methods.getProposals(queryParams);
console.log(addresslistVotingProposals);

/* MARKDOWN
Returns:

```json
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
      summary: "test proposal summary"
    },
    startDate: <Date>,
    endDate: <Date>,
    status: "Executed",
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
      summary: "test proposal summary 2"
    },
    startDate: <Date>,
    endDate: <Date>,
    status: "Pending",
    results {
      yes: 100000n,
      no: 77777n,
      abstain: 0n
    }
  }
]
```
*/
