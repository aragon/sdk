/* Header
## Depositing ERC20 tokens to a DAO

Handles the flow of depositing ERC20 tokens to a DAO.

- Similar to the example above
- The `tokenAddress` field is required
- Will attempt to increase the ERC20 allowance if not sufficient
- More intermediate steps are yielded

*/
/* Code */
import {
  Client,
  Context,
  DaoDepositSteps,
  GasFeeEstimation,
  IDepositParams,
} from "@aragon/sdk-client";
import { contextParams } from "../constants";

const context = new Context(contextParams);
const client = new Client(context);
const depositParams: IDepositParams = {
  daoAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
  reference: "test deposit", // optional
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(
  depositParams,
);
console.log(estimatedGas.average);
console.log(estimatedGas.max);

const steps = client.methods.deposit(depositParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoDepositSteps.CHECKED_ALLOWANCE:
        console.log(step.allowance); // 0n
        break;
      case DaoDepositSteps.UPDATING_ALLOWANCE:
        console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
        break;
      case DaoDepositSteps.UPDATED_ALLOWANCE:
        console.log(step.allowance); // 10n
        break;
      case DaoDepositSteps.DEPOSITING:
        console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
        break;
      case DaoDepositSteps.DONE:
        console.log(step.amount); // 10n
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
/* - */
