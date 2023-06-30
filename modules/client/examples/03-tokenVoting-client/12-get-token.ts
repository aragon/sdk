/* MARKDOWN
---
title: Get Token Details
---

## Get Token Details

Returns the token details used in the TokenVoting plugin for a given DAO.
These are the details of the token used to vote in that specific DAO.
*/

import { TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

// The address of the TokenVoting plugin whose token you want to retrieve details about.
const pluginAddress: string = "0x1234567890123456789012345678901234567890";

// Get the token details used in the TokenVoting plugin for a given DAO.
// ERC721 Token coming soon!
const tokenDetails = await tokenVotingClient.methods.getToken(pluginAddress);
console.log(tokenDetails);

/* MARKDOWN
Returns:

```
{
  type: 'erc20',
  address: "0x1234567890987654323112345678900987654321",
  name: "Token",
  symbol: "TOK",
  decimals: 18
}
```
Or:
```
{
  address: '0x1234567890987654323112345678900987654321',
  name: 'Wrapped Token',
  symbol: 'wTOK',
  decimals: 18,
  underlyingToken: {
    address: '0x012345678900098765432311234567890098765432',
    name: 'Token',
    symbol: 'TOK',
    decimals: 18,
    type: 'erc20'
  },
  type: 'erc20'
}
```
Or:
```
{
  type: 'erc721',
  address: "0x1234567890987654323112345678900987654321",
  name: "Token",
  symbol: "TOK"
}
```
*/
