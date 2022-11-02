/* MARKDOWN
### Loading the list of proposals (ERC20)

Retrieving the proposals of an ERC20 DAO.
*/
import {
  ClientErc20,
  Context,
  ContextPlugin,
  Erc20ProposalListItem,
  IProposalQueryParams,
  ProposalSortBy,
  SortDirection,
  ProposalStatus,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an ERC20 client
const client = new ClientErc20(contextPlugin);

const queryParams: IProposalQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: ProposalSortBy.POPULARITY, // optional
  status: ProposalStatus.ACTIVE, // optional
};

const proposals: Erc20ProposalListItem[] = await client.methods.getProposals(
  queryParams,
);
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
      summary: "test proposal summary 2"
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
*/