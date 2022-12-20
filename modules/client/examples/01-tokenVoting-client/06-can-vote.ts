/* MARKDOWN
### Checking if user can vote in a TokenVoting proposal
*/
import {
  Context,
  ContextPlugin,
  ICanVoteParams,
  TokenVotingClient,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new TokenVotingClient(contextPlugin);

const voteParams: ICanVoteParams = {
  addressOrEns: "0x1234567890123456789012345678901234567890",
  proposalId: BigInt(1),
  pluginAddress: "0x1234567890123456789012345678901234567890",
};

const canVote = await client.methods.canVote(voteParams);
console.log(canVote);
/*
true
*/
