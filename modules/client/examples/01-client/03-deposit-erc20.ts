/* MARKDOWN
### Deposit ERC20 tokens to a DAO

Deposits ERC20 tokens to a DAO.

- Similar to the ETH deposit flow
- The `tokenAddress` field is required. This is the contract address of the ERC-20 token.
- Will attempt to increase the ERC20 allowance if not sufficient.
- More intermediate steps are yielded.
*/

import {
  Client,
  DaoDepositSteps,
  GasFeeEstimation,
  DepositParams,
  TokenType
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate the general purpose client from the aragonOSx SDK context.
const client: Client = new Client(context);

const depositParams: DepositParams = {
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // my-dao.dao.eth
  amount: BigInt(10), // amount in wei
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
  type: TokenType.ERC20 // "erc20" for ERC20 token, otherwise "native" for EVM native token (ETH, MATIC, etc)
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(depositParams);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Deposit the ERC20 tokens.
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
    console.error({ err });
  }
}
