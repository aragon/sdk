/* MARKDOWN
### Get the list of proposals of a DAO (TokenVoting)

Retrieves the proposals of a DAO created with the `TokenVoting` plugin.
*/

import {
  ContextPlugin,
  IProposalQueryParams,
  SortDirection,
  ProposalSortBy,
  ProposalStatus,
  TokenVotingClient,
  TokenVotingProposalListItem
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Create a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional
  direction: SortDirection.ASC, // optional, otherwise DESC ("descending")
  sortBy: ProposalSortBy.POPULARITY, // optional, otherwise CREATED_AT, NAME, VOTES
  status: ProposalStatus.ACTIVE // optional, otherwise PENDING, SUCCEEDED, EXECUTED, DEFEATED
};

const proposals: TokenVotingProposalListItem[] = await tokenVotingClient.methods.getProposals(queryParams);
console.log({ proposals });

/* MARKDOWN
Returns:

```json
[
  {
    id: "0x12345...",
    dao: {
      address: "0x1234567890123456789012345678901234567890",
      name: "Cool DAO"
    };
    creatorAddress: "0x1234567890123456789012345678901234567890",
    metadata: {
      title: "Test Proposal",
      summary: "Test Proposal Summary"
    };
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
    };
    creatorAddress: "0x1234567890123456789012345678901234567890",
    metadata: {
      title: "Test Proposal 2",
      summary: "Test Proposal Summary 2"
    };
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
