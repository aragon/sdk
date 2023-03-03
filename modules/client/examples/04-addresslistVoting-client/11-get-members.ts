/* MARKDOWN
### Get list of members (AddresslistVoting)

Gets an array of all addresses able to vote in a specific AddresslistVoting DAO proposal.
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddressList client.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const daoAddressorEns = "0x12345382947301297439127433492834"; // or my-dao.dao.eth

const members: string[] = await addresslistVotingClient.methods.getMembers(daoAddressorEns);
console.log({ members });

/* MARKDOWN
Returns:

```json
{ members :
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
