/* MARKDOWN
### Ensure an a minimum token allowance
Check if the allowance is enough and updates it if it is not

*/
import {
  Client,
  Context,
  DaoDepositSteps,
  UpdateAllowanceParams,
} from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context = new Context(contextParams);
const client = new Client(context);
const updateAllowanceParams: UpdateAllowanceParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
};

const steps = client.methods.updateAllowance(updateAllowanceParams);
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
    }
  } catch (err) {
    console.error(err);
  }
}
