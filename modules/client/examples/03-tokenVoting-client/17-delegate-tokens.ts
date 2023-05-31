/* MARKDOWN
---
title: Delegate Tokens
---

## Delegates yout token voting power to another address

Delegates your token voting power to another address. To recover yout voting power back just delegate to your own address.
*/

import {
  DelegateTokensParams,
  DelegateTokensStep,
  TokenVotingClient,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);

const delegateTokensParams: DelegateTokensParams = {
  delegatee: "0x1234567890123456789012345678901234567890",
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
};

const steps = tokenVotingClient.methods.delegateTokens(delegateTokensParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case DelegateTokensStep.DELEGATING:
        console.log(step.txHash);
        break;
      case DelegateTokensStep.DONE:
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
