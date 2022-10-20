/* MARKDOWN
### Loading Multiple DAOs

Handles retrieving list of DAO metadata.

*/
import {
  Client,
  Context,
  DaoListItem,
  DaoSortBy,
  IDaoQueryParams,
  SortDirection,
} from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const queryParams: IDaoQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: DaoSortBy.POPULARITY, //optional
};
const daos: DaoListItem[] = await client.methods.getDaos(queryParams);
console.log(daos);

/*
[
  {
    address: "0x12345...",
    ensDomain: "test.dao.eth",
    metadata: {
        name: "Test",
        description: "This is a description"
    };
    plugins: [
      {
        id: "erc20-voting.plugin.dao.eth",
        instanceAddress: "0x12345..."
      }
    ]
  },
  {
    address: "0x12345...",
    ensDomain: "test-1.dao.eth", // on mainnet
    metadata: {
        name: "Test 1",
        description: "This is a description 1"
    };
    plugins: [
      {
        id: "addressList-voting.plugin.dao.eth",
        instanceAddress: "0x12345..."
      }
    ]
  },
  {
    address: "0x12345...",
    ensDomain: "test-2.dao.eth",
    metadata: {
        name: "Test 2",
        description: "This is a description 2"
    };
    plugins: [
      {
        id: "erc20-voting.plugin.dao.eth",
        instanceAddress: "0x12345..."
      }
    ]
  }
]
*/
