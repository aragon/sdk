/* MARKDOWN
### Check if an address can vote in a TokenVoting proposal

This function returns a boolean indicating whether an address can vote in a specific TokenVoting proposal.
*/
import {
  Context,
  ContextPlugin,
  ICanVoteParams,
  TokenVotingClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an TokenVoting client
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const canVoteParams: ICanVoteParams = {
  address: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890_0x1",
  pluginAddress: "0x1234567890123456789012345678901234567890"
};

const canVote = await tokenVotingClient.methods.canVote(canVoteParams);
console.log({ canVote });

/*
Returns:
```javascript
  true
```
*/
