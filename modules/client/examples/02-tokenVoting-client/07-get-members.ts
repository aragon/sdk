/* MARKDOWN
### Get members in a DAO using the TokenVoting plugin

Returns an array with the addresses of all the members of a DAO using the TokenVoting plugin.
*/

import { ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const daoAddressorEns: string = "0x12345384572394756239846529574932532985";

const members: string[] = await tokenVotingClient.methods.getMembers(daoAddressorEns);
console.log({ members });

/* MARKDOWN
Returns:

```json
[
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
  "0x5678901234567890123456789012345678901234"
]
```
*/
