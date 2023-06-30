/* MARKDOWN
---
title: Get Proposals
---

## Get All Multisig Proposals That Have Been Created

Gets the proposals made using the Multisig plugin for a given DAO.
*/

import {
  MultisigClient,
  MultisigProposalListItem,
  ProposalQueryParams,
  ProposalSortBy,
} from "@aragon/sdk-client";
import { ProposalStatus, SortDirection } from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiate a Multisig client
const multisigClient: MultisigClient = new MultisigClient(context);

const queryParams: ProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional
  direction: SortDirection.ASC, // optional. otherwise, DESC
  sortBy: ProposalSortBy.CREATED_AT, //optional. otherwise, NAME, VOTES (POPULARITY coming soon)
  status: ProposalStatus.ACTIVE, // optional. otherwise, PENDING, SUCCEEDED, EXECUTED, DEFEATED
  daoAddressOrEns: "0x1234348529348570294650287698237520938574284357", // or my-dao.dao.eth
};

const multisigProposals: MultisigProposalListItem[] = await multisigClient
  .methods.getProposals(queryParams);
console.log(multisigProposals);

/* MARKDOWN
Returns:

```
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
    status: "Executed"
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
    status: "Pending"
  }
]
```
*/
