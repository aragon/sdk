/* MARKDOWN
### Get list of members in a DAO (token-holders)

Returns an array with the addresses of all the members of a DAO using the TokenVoting plugin.
*/

import { Context, ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const daoAddressorEns: string = "0x12345...";

const members: string[] = await tokenVotingClient.methods.getMembers(daoAddressorEns);
console.log({ members });
/*
Returns:
```json
[
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
  "0x5678901234567890123456789012345678901234",
]
```
*/
