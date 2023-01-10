/* MARKDOWN
### Loading the list of members (TokenVoting)

Retrieving all the members of a TokenVoting DAO.
*/
import { Context, ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting client
const client = new TokenVotingClient(contextPlugin);

const daoAddressorEns = "0x12345...";

const members: string[] = await client.methods.getMembers(daoAddressorEns);
console.log(members);
/*
[
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
  "0x5678901234567890123456789012345678901234",
]
*/
