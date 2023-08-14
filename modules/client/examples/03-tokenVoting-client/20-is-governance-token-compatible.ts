/* MARKDOWN
---
title: Is governance token compatible
---

## Check if a token is compatible with the TokenVoting Plugin as an underlying token

Check if a token is compatible with the TokenVoting Plugin as an underlying token. This means that the token is ERC20 and ERC165 compliant and has the required methods for the TokenVoting Plugin to work.
*/

import { TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

const tokenAddress = "0x1234567890123456789012345678901234567890"; // token contract adddress

const delegatee = tokenVotingClient.methods.isTokenGovernanceCompatible(tokenAddress);

console.log(delegatee);

/* MARKDOWN
  Returns:
  ```ts
    true // throw if the token is not compatible
  ```
  */
