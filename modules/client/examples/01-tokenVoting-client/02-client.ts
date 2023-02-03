/* MARKDOWN
### Create a TokenVoting client

In order to interact with the TokenVoting plugin, you need to create a `TokenVotingClient`. This is created using the `ContextPlugin` we just instantiated.
*/
import { Context, ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient = new TokenVotingClient(contextPlugin);

console.log({ tokenVotingClient });
