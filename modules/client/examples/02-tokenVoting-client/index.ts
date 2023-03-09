/* MARKDOWN
---
title: Token Voting Client
---

## Create a Token Voting Client

In order to interact with the `TokenVoting` plugin, you need to create a `TokenVotingClient`.
This is created using the `ContextPlugin` which grants us access to plugins within the SDK.
*/

import { ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the ContextPlugin from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create a TokenVoting client.
const tokenVotingClient = new TokenVotingClient(contextPlugin);
console.log({ tokenVotingClient });
