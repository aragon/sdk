/* MARKDOWN
### Get token details (TokenVoting)

Returns the token details used in the TokenVoting plugin for a given DAO.
These are the details of the token used to vote in that specific DAO.
*/

import {
  ContextPlugin,
  Erc20TokenDetails,
  Erc721TokenDetails,
  TokenVotingClient
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

// The address of the TokenVoting plugin whose token you want to retrieve details about.
const pluginAddress: string = "0x1234567890123456789012345678901234567890";

// Get the token details used in the TokenVoting plugin for a given DAO.
const tokenDetails: Erc20TokenDetails | Erc721TokenDetails | null = await tokenVotingClient.methods.getToken(pluginAddress);
console.log({ tokenDetails });

/* MARKDOWN
Returns:

```json
  {
    address: "0x123456789000987654323112345678900987654321",
    name: "Token",
    symbol: "TOK",
    decimals: 18
  }
```
Or:
```json
  {
    address: "0x123456789000987654323112345678900987654321",
    name: "Token",
    symbol: "TOK",
    baseUri: "base.uri"
  }
```
*/
