/* MARKDOWN
### Decode Mint Token Action (TokenVoting)
*/
import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  IMintTokenParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const tokenVotingClient = new TokenVotingClient(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: IMintTokenParams = tokenVotingClient.decoding.mintTokenAction(data);

console.log(params);
/*
{
  address: "0x12345...",
  amount: 10n
}
*/
