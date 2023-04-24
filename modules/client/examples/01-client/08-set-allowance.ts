/* MARKDOWN
---
title: ERC-20 Allowance
---

## Updates an ERC-20 Tokens' Allowance

In order for an address to deposit an ERC20 token into the DAO, the allowance approval for that token needs to be set to the amount the person wants to deposit.
This function ensures the allowance approval is set to that amount.
Refer to OpenZeppelin docs here on ERC20's token allowance methods: https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#IERC20-allowance-address-address-).

This function updates the allowance approval to the amount specified.
*/

import {
  Client,
  SetAllowanceParams,
  SetAllowanceSteps,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const setAllowanceParams: SetAllowanceParams = {
  spender: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
};

const steps = client.methods.setAllowance(setAllowanceParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case SetAllowanceSteps.SETTING_ALLOWANCE:
        console.log({ updateAllowanceTxHash: step.txHash });
        break;
      case SetAllowanceSteps.ALLOWANCE_SET:
        console.log({ updatedAllowance: step.allowance });
        break;
    }
  } catch (err) {
    console.error(err);
  }
}

/* MARKDOWN
Returns:
```tsx
{
  checkedAllowance: 0n
}
{
  updateAllowanceTxHash: "0xb1c14a49...3e8620b0f5832d61c"
}
{
  updatedAllowance: 10n
}
```
*/
