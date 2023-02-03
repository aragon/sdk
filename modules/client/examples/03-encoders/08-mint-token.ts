/* MARKDOWN
### Mint tokens for a DAO with the TokenVoting plugin installed

Mints tokens for a DAO using the TokenVoting plugin.
*/

import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  IMintTokenParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const params: IMintTokenParams = {
  address: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
};

const minterAddress = "0x0987654321098765432109876543210987654321";
const mintTokenAction = tokenVotingClient.encoding.mintTokenmintTokenAction(minterAddress, params);
console.log(mintTokenAction);
/*
{
  to: "0x0987654321098765432...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
