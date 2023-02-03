/* MARKDOWN
### Get the list of a given DAO's proposals made using the Multisig plugin.

Gets the proposals made using the Multisig plugin for a given DAO.
*/

import {
  ContextPlugin,
  IProposalQueryParams,
  MultisigClient,
  MultisigProposalListItem,
  SortDirection,
  ProposalSortBy,
  ProposalStatus
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.POPULARITY, //optional
  status: ProposalStatus.ACTIVE, // optional
  daoAddressOrEns: "0x1234348529348570294650287698237520938574284357"
};

const multisigProposals: MultisigProposalListItem[] = await multisigClient.methods.getProposals(queryParams);
console.log({ multisigProposals });

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
