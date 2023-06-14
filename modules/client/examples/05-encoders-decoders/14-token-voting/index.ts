/* MARKDOWN
---
title: Token Voting
---

## Actions of the Token Voting Plugin

With an instance of the `TokenVotingClient`
*/

import { TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiates a plugin context from the Aragon OSx SDK context.

// Instantiates a TokenVoting client.
export const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

/* MARKDOWN
actions can encoded and decoded as demonstrated in the following examples.
*/
