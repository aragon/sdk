/* MARKDOWN
---
title: Is TokenVoting compatible token
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

const compatibility = tokenVotingClient.methods.isTokenVotingCompatibleToken(tokenAddress);

console.log(compatibility);

/* MARKDOWN
  Returns:
  ```ts
    // "compatible" if is erc20 and erc165
    // "needsWrap" if is erc20 and not erc165 or compatible with voting
    // "incompatible" if is not erc20
    compatible
  ```
  */
