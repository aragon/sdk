/* MARKDOWN
### Ensure an a minimum ERC20 token allowance

In order for an address to deposit an ERC20 token into the DAO, the allowance approval for that token needs to be set at the amount the person wants to deposit.
This function ensures the allowance approval is set so that amount.
Refer to OpenZeppelin docs here on ERC20's token allowance methods: https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#IERC20-allowance-address-address-).
*/

import {
  Client,
  DaoDepositSteps
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate the general purpose client from the aragonOSx SDK context.
const client: Client = new Client(context);

const ensureAllowanceParams = {
  amount: BigInt(10), // amount in wei
  daoAddress: "0x1234567890123456789012345678901234567890",
  tokenAddress: "0x1234567890123456789012345678901234567890" // token contract adddress
};

// Ensure the token's approval allowance is enough.
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
