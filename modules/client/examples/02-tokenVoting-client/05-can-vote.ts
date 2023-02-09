/* MARKDOWN
### Check if an address can vote in a TokenVoting proposal

This function returns a boolean indicating whether an address can vote in a specific TokenVoting proposal.
*/

import {
  ContextPlugin,
  ICanVoteParams,
  TokenVotingClient
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create an TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const canVoteParams: ICanVoteParams = {
  address: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890_0x1",
  pluginAddress: "0x1234567890123456789012345678901234567890"
};

// Returns true or false depending on whether the address can vote in the specific proposal.
const canVote: boolean = await tokenVotingClient.methods.canVote(canVoteParams);
console.log({ canVote });

/* MARKDOWN
Returns:

```javascript
  true
```
*/
