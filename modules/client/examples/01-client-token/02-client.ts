/* MARKDOWN
### Create a TokenVoting client
*/
import { Context, ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

const client = new TokenVotingClient(contextPlugin);

console.log(client);
