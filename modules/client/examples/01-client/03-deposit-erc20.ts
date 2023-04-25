/* MARKDOWN
---
title: ERC-20 Deposits
---

### Deposit ERC-20 Tokens to a DAO

Deposits ERC-20 tokens to a DAO.

- Similar to the ETH deposit flow
- The `tokenAddress` field is required. This is the contract address of the ERC-20 token.
- Will attempt to increase the ERC20 allowance if not sufficient.
- More intermediate steps are yielded.
*/

import {
  Client,
  DaoDepositSteps,
  DepositParams,
  GasFeeEstimation,
  SetAllowanceSteps,
  TokenType,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const depositParams: DepositParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // my-dao.dao.eth
  amount: BigInt(10), // amount in wei
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
  type: TokenType.ERC20, // "erc20" for ERC20 token, otherwise "native" for ETH
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(
  depositParams,
);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Deposit the ERC20 tokens.
const steps = client.methods.deposit(depositParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoDepositSteps.CHECKED_ALLOWANCE:
        console.log({ checkedAllowance: step.allowance });
        break;
      case SetAllowanceSteps.SETTING_ALLOWANCE:
        console.log({ updateAllowanceTxHash: step.txHash });
        break;
      case SetAllowanceSteps.ALLOWANCE_SET:
        console.log({ updatedAllowance: step.allowance });
        break;
      case DaoDepositSteps.DEPOSITING:
        console.log({ depositingTxHash: step.txHash });
        break;
      case DaoDepositSteps.DONE:
        console.log({ amount: step.amount });
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
{
  depositingTxHash: "0xb1c14a49...3e8620b0f5832d61c"
}
{
  amount: 10n
}
```
*/
