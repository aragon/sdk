/* MARKDOWN
### Checking if user can vote in a address list proposal
*/
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  ICanVoteParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an address list client
const client = new AddresslistVotingClient(contextPlugin);

const voteParams: ICanVoteParams = {
  addressOrEns: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890000000000000000000000001",
  pluginAddress: "0x1234567890123456789012345678901234567890",
};

const canVote = await client.methods.canVote(voteParams);
console.log(canVote);
/*
true
*/
