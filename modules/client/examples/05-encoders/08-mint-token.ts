/* MARKDOWN
### Mint tokens for a DAO with the TokenVoting plugin installed

Mints tokens for a DAO using the TokenVoting plugin.
*/

import {
  ContextPlugin,
  DaoAction,
  IMintTokenParams,
  TokenVotingClient
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const params: IMintTokenParams = {
  address: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10)
};

const minterAddress: string = "0x0987654321098765432109876543210987654321";

const mintTokenAction: DaoAction = tokenVotingClient.encoding.mintTokenAction(minterAddress, params);
console.log(mintTokenAction);

/* MARKDOWN
Returns:

```json
{
  to: "0x0987654321098765432...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```
*/
