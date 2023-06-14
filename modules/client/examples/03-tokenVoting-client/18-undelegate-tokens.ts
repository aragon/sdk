/* MARKDOWN
---
title: Undelegate Tokens
---

## Undelegates yout token voting power from the delegatee address

This is the same as delegating to your own address.
*/

import { TokenVotingClient, UndelegateTokensStep } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

const tokenAddress = "0x1234567890123456789012345678901234567890";

const steps = tokenVotingClient.methods.undelegateTokens(tokenAddress);

for await (const step of steps) {
  try {
    switch (step.key) {
      case UndelegateTokensStep.UNDELEGATING:
        console.log(step.txHash);
        break;
      case UndelegateTokensStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}

/* MARKDOWN
  Returns:
  ```ts
    "0xb1c14a49...3e8620b0f5832d61c"
  ```
  */
