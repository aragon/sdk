/* MARKDOWN
---
title: Token Voting Client
---

## Create a Token Voting Client

The `TokenVoting` plugin allows token holders to create and vote on proposals.
The token contract created by the TokenVoting setup contract follow OpenZeppelin's ERC20Votes standard: https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Votes

In order to interact with the `TokenVoting` plugin, you need to create a `TokenVotingClient`.
This is created using the `ContextPlugin` which grants us access to plugins within the SDK.
*/

import { TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the ContextPlugin from the Aragon OSx SDK context.


// Create a TokenVoting client.
const tokenVotingClient = new TokenVotingClient(context);
console.log(tokenVotingClient);
