/* MARKDOWN
### Depositing ERC721 tokens to a DAO

Handles the flow of depositing a ERC721 token to a DAO.
*/
import {
    Client,
    Context,
    DaoDepositSteps,
    GasFeeEstimation,
    DepositParams,
    DepositType,
  } from "@aragon/sdk-client";
  import { contextParams } from "./00-context";
  
  const context = new Context(contextParams);
  const client = new Client(context);
  const depositParams: DepositParams = {
    type: DepositType.ERC721,
    daoAddressOrEns: "0x1234567890123456789012345678901234567890",
    tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
    reference: "test deposit nft", // optional
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
  