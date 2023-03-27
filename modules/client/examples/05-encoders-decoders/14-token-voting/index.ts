/* MARKDOWN
---
title: Token Voting
---

## Actions of the Token Voting Plugin

With an instance of the `TokenVotingClient`
*/


import {
  ContextPlugin,
  TokenVotingClient,
} from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiates a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates a TokenVoting client.
export const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

/* MARKDOWN
actions can encoded and decoded as demonstrated in the following examples.
*/