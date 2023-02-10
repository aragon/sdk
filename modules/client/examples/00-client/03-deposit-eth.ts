/* MARKDOWN
### Depositing ETH to a DAO

Handles the flow of depositing the native token to an Aragon DAO.

*/
import {
  Client,
  Context,
  DaoDepositSteps,
  GasFeeEstimation,
  DepositParams,
  TokenType
} from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const depositParams: DepositParams = {
  type: TokenType.NATIVE,
  daoAddressOrEns: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10), // amount in wei
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
