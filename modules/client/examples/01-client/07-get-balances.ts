/* MARKDOWN
### Get a DAO's balance

Gets a DAO's financial assets based on the DAO address or its ENS domain.
*/

import { AssetBalance, Client } from "@aragon/sdk-client";
import { context } from "./index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// Address of the DAO whose asset balances you want to retrieve.
const daoAddressOrEns: string = "0x12345...";

// Get a DAO's asset balances.
const daoBalances: AssetBalance[] | null = await client.methods.getDaoBalances({ daoAddressOrEns });
console.log({ daoBalances });

/* MARKDOWN
Returns:

```json
{ daoBalances:
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
}
```
*/
