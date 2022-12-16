/* MARKDOWN
### Loading the list of proposals (address list plugin)
*/
import {
  AdminProposalListItem,
  ClientAdmin,
  Context,
  ContextPlugin,
  IProposalQueryParams,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new ClientAdmin(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.POPULARITY, //optional
  status: ProposalStatus.ACTIVE, // optional
};

const proposals: AdminProposalListItem[] = await client.methods
  .getProposals(queryParams);
console.log(proposals);
/*
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
      summary: "test proposal summary"
    };
    creationDate: <Date>,
    administratorAddress: "0x1234567890123456789012345678901234567890",
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
      summary: "test proposal summary 2"
    };
    creationDate: <Date>,
    administratorAddress: "0x1234567890123456789012345678901234567890",
    status: "Executed"
  }
]
*/
