/* MARKDOWN
### Get a DAO's financial data

Retrieves a DAO's asset balances using the DAO address or its ENS domain.
*/

import { AssetBalance, Client } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate the general purpose client from the aragonOSx SDK context.
const client: Client = new Client(context);

// Address of the DAO whose asset balances you want to retrieve.
const daoAddressOrEns: string = "0x12345...";

// Get a DAO's asset balances.
const daoBalances: AssetBalance[] | null = await client.methods.getDaoBalances(daoAddressOrEns);
console.log({ daoBalances });

/* MARKDOWN
Returns:

```json
  [
    {
      type: "native",
      balance: 100000n,
      lastUpdate: <Date>
    },
    {
      type: "erc20",
      address: "0x1234567890123456789012345678901234567890"
      name: "The Token",
      symbol: "TOK",
      decimals: 18,
      balance: 200000n
      lastUpdate: <Date>
    },
    ...
  ]
```
*/
