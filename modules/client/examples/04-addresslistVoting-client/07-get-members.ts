/* MARKDOWN
### Get list of members (AddresslistVoting)

Retrieves an array of all addresses able to vote in a specific AddresslistVoting DAO proposal.
*/

import { AddresslistVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddressList client.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const daoAddressorEns = "0x12345..."; // or my-dao.dao.eth

const members: string[] = await addresslistVotingClient.methods.getMembers(daoAddressorEns);
console.log(members);

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
