/* MARKDOWN
### Create an TokenVoting client
*/
import { TokenVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

const client = new TokenVotingClient(contextPlugin);

console.log(client);
