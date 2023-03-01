/* MARKDOWN
### Get list of members (AddresslistVoting)

Gets an array of all addresses able to vote in a specific AddresslistVoting DAO proposal.
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddressList client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const pluginAddress = "0x12345382947301297439127433492834";

const members: string[] = await addresslistVotingClient.methods.getMembers(pluginAddress);
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
