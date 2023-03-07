/* MARKDOWN
### Get transfers from DAO's activity

Gets the list of asset transfers to and from DAOs.
If passed a `daoAddressOrEns`, will only retrieve transfers for that DAO. Otherwise, it returns for all DAOs.

By default, retrieves ETH, DAI, USDC and USDT, on Mainnet).
*/

import {
  Client,
  ITransferQueryParams,
  SortDirection,
  Transfer,
  TransferSortBy,
  TransferType
} from "@aragon/sdk-client";
import { context } from "./01-getting-started";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const params: ITransferQueryParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // optional
  sortBy: TransferSortBy.CREATED_AT, // optional
  limit: 10, // optional
  skip: 0, // optional
  direction: SortDirection.ASC, // optional, options: DESC or ASC
  type: TransferType.DEPOSIT // optional, options: DEPOSIT or WITHDRAW
};

// Get a list of DAO transfers based on params set.
const daoTransfers: Transfer[] | null = await client.methods.getDaoTransfers(params);
console.log({ daoTransfers });

/* MARKDOWN
Returns:

```json
{ daoTransfers:
  [
    {
      type: "withdraw",
      tokenType: "erc20",
      token: {
        address: "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735",
        name: "Dai Stablecoin",
        symbol: "DAI",
        decimals: 18,
      },
      amount: 1000000000000000n,
      creationDate: <Date>
      reference: "withdrawing from dao to:0xc8541aAE19C5069482239735AD64FAC3dCc52Ca2",
      transactionId: "0xdb0f9422b5c3199021481c98a655741ca16119ff8a59571854a94a6f31dad7ba",
      to: "0xc8541aae19c5069482239735ad64fac3dcc52ca2",
      proposalId: "0x1234567890123456789012345678901234567890_0x0"
    },
    {
      type: "deposit",
      tokenType: "native",
      amount: 1000000000000000n,
      creationDate: <Date>
      reference: "dummy deposit of ETH, amount:0.001",
      transactionId: "0xc18b310b2f8cf427d95fa905dc842df2cf999075f18579afbcbdce19f8db0a30",
      from: "0xc8541aae19c5069482239735ad64fac3dcc52ca2",
    },
    {
      type: "deposit",
      tokenType: "erc20",
      token: {
        address: "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735",
        name: "Dai Stablecoin",
        symbol: "DAI",
        decimals: 18,
      },
      amount: 1000000000000000n,
      creationDate: <Date>
      reference: "dummy deposit of Dai, amount:0.001",
      transactionId: "0xdd8fff77c1f3e819d4224f8d02a00583c7e5d55475b8a9d70867aee0d6d16f07",
      from: "0xc8541aae19c5069482239735ad64fac3dcc52ca2",
    }
  ]
}
```
*/
