/* MARKDOWN
### Mint tokens for a DAO (TokenVoting)

Mints tokens for a DAO that has the TokenVoting plugin installed.
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
  address: "0x1234567890123456789012345678901234567890", // address which will receive the minted tokens
  amount: BigInt(10) // amount of tokens they will receive
};

const minterAddress: string = "0x0987654321098765432109876543210987654321"; // if not provided, the default minter (Open Zeppellin's ERC20 contract) will be used.

const mintTokenAction: DaoAction = tokenVotingClient.encoding.mintTokenAction(minterAddress, params);
console.log({ mintTokenAction });

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
