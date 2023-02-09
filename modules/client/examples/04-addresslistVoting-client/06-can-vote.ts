/* MARKDOWN
### Check if an address can vote in a proposal (Addresslist)

Checks whether an address is able to participate in a DAO proposal created using the Addresslist Voting plugin.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  ICanVoteParams
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddresslistVoting client.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const voteParams: ICanVoteParams = {
  address: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890_0x1",
  pluginAddress: "0x1234567890123456789012345678901234567890" // the address of the plugin contract itself.
};

const canVote = await addresslistVotingClient.methods.canVote(voteParams);
console.log(canVote);

/* MARKDOWN
Returns:
```javascript
  true
```
*/
