/* MARKDOWN
### Ensure an a minimum token allowance

Check if the existing DAO allowance is enough, updates it if it is not.
*/

import {
  Client,
  DaoDepositSteps
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate the general purpose client from the aragonOSx SDK context.
const client: Client = new Client(context);

const ensureAllowanceParams = {
  daoAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount in wei
  tokenAddress: "0x1234567890123456789012345678901234567890" // token contract adddress
};

// Ensure the allowance is enough.
const steps = client.methods.ensureAllowance(ensureAllowanceParams);
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
