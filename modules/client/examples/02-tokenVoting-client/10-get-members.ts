/* MARKDOWN
### Get members in a DAO (with the TokenVoting plugin installed)

Returns an array with the addresses of all the members of a specific DAO which has the TokenVoting plugin installed.
*/

import { ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const pluginAddress: string = "0x12345384572394756239846529574932532985"; // the address of the plugin that DAO has installed. You can find this through getting the DAO details.

const members: string[] = await tokenVotingClient.methods.getMembers(pluginAddress);
console.log({ members });

/* MARKDOWN
Returns:

```json
{ members:
  [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123",
    "0x5678901234567890123456789012345678901234"
  ]
}
```
*/
