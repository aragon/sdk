/* MARKDOWN
### Get a TokenVoting Plugin's token details
*/

import {
  Context,
  ContextPlugin,
  Erc20TokenDetails,
  TokenVotingClient,
} from "@aragon/sdk-client";
import { Erc721TokenDetails } from "../../src/tokenVoting/interfaces";
import { contextParams } from "../00-client/00-context";

// Create a context from the Aragon SDK.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

// Get the token details used in the TokenVoting plugin for a given DAO.
const tokenDetails: Erc20TokenDetails | Erc721TokenDetails | null = await tokenVotingClient.methods.getToken(pluginAddress);
console.log({ tokenDetails });

/*
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
