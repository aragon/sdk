/* MARKDOWN
---
title: Wrap Tokens
---

## Wrap ERC-20 tokens

*/

import {
  Client,
  SetAllowanceSteps,
  TokenVotingClient,
  WrapTokensStep,
} from "@aragon/sdk-client";
import { context } from "../index";

// Create a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(
  context,
);
// Create a TokenVoting client.
const client: Client = new Client(
  context,
);

const amount = BigInt(10);
const wrappedTokenAddress = "0x1234567890123456789012345678901234567890";
const tokenAddress = "0x2345678901234567890123456789012345678901";

// must give the wrapped token contract allowance to wrap the tokens
const setAllowanceSteps = client.methods.setAllowance({
  amount,
  spender: wrappedTokenAddress,
  tokenAddress,
});
for await (const step of setAllowanceSteps) {
  try {
    switch (step.key) {
      case SetAllowanceSteps.SETTING_ALLOWANCE:
        console.log(step.txHash);
        break;
      case SetAllowanceSteps.ALLOWANCE_SET:
        console.log(step.allowance);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}

const wrapTokenSteps = tokenVotingClient.methods.wrapTokens(
  {
    wrappedTokenAddress,
    amount,
  },
);

for await (const step of wrapTokenSteps) {
  try {
    switch (step.key) {
      case WrapTokensStep.WRAPPING:
        console.log(step.txHash);
        break;
      case WrapTokensStep.DONE:
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
