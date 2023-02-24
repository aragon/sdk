/* MARKDOWN
## Create a TokenVoting client

In order to interact with the `TokenVoting` plugin, you need to create a `TokenVotingClient`.
This is created using the `ContextPlugin` which grants us access to plugins within the SDK.
*/

import { ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate the ContextPlugin from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient = new TokenVotingClient(contextPlugin);
console.log({ tokenVotingClient });
