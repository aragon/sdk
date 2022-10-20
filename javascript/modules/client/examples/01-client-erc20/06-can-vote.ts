/* MARKDOWN
### Checking if user can vote in an ERC20 proposal
*/
import {
  ClientErc20,
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
const client = new ClientErc20(contextPlugin);

const voteParams: ICanVoteParams = {
  address: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890_0x1",
  pluginAddress: "0x1234567890123456789012345678901234567890",
};

const canVote = await client.methods.canVote(voteParams);
console.log(canVote);
/*
true
*/
