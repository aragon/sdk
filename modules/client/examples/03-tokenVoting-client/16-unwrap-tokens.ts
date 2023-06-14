/* MARKDOWN
---
title: Unwrap Tokens
---

## Unwrap ERC-20 tokens

*/

import { TokenVotingClient, UnwrapTokensStep } from "@aragon/sdk-client";
import { context } from "../index";

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

const amount = BigInt(10);
const wrappedTokenAddress = "0x1234567890123456789012345678901234567890";

const wrapTokenSteps = tokenVotingClient.methods.unwrapTokens(
  {
    wrappedTokenAddress,
    amount,
  },
);

for await (const step of wrapTokenSteps) {
  try {
    switch (step.key) {
      case UnwrapTokensStep.UNWRAPPING:
        console.log(step.txHash);
        break;
      case UnwrapTokensStep.DONE:
        break;
    }
  } catch (err) {
    console.error(err);
  }
}

/* MARKDOWN
    Returns:
    ```tsx
    "0xb1c14a49...3e8620b0f5832d61c"
    ```
    */
