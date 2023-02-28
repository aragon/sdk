/* MARKDOWN
### Check if an address can vote in a proposal (Addresslist)

Checks whether an address is able to participate in a DAO proposal created using the Addresslist Voting plugin.
*/

import {
  AddresslistVotingClient,
  CanVoteParams,
  ContextPlugin,
  VoteValues
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an AddresslistVoting client
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const voteParams: CanVoteParams = {
  voterAddressOrEns: "0x1234567890123456789012345678901234567890", // the address who's potential to vote you want to check
  proposalId: "0x123456789012345678901234567890123456789080x0",
  vote: VoteValues.YES // this doesn't execute the vote itself, simply checks whether that address can execute that vote. VoteValues can be NO, YES, or ABSTAIN
};

const canVote = await addresslistVotingClient.methods.canVote(voteParams);
console.log({ canVote });

/* MARKDOWN
Returns:

```json
  { canVote: true }
```
*/
