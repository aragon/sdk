/* MARKDOWN
---
title: Deposit ERC-1155
---

### Deposit ERC-1155 Tokens to a DAO

Deposits ERC-1155 tokens to a DAO.

- Similar to the ERC20 deposit flow
- The `tokenAddress` field is required. This is the contract address of the ERC-1155 token.
- TokenIds is required. This is the token ID of the ERC-1155 token.
- Amounts is required. This is the amount of the ERC-1155 token to deposit.
- Supports depositing multiple ERC-1155 tokens in a single transaction.
- Calls the safeTransferFrom or safeBatchTransferFrom function of the ERC-1155 token contract.
- If only one token ID is provided, the safeTransferFrom function is called.
- If multiple token IDs are provided, the safeBatchTransferFrom function is called.
*/

import {
    Client,
    DaoDepositSteps,
    DepositParams,
  } from "@aragon/sdk-client";
  import { GasFeeEstimation, TokenType } from "@aragon/sdk-client-common";
  import { context } from "../index";
  
  // Instantiate the general purpose client from the Aragon OSx SDK context.
  const client: Client = new Client(context);
  
  const depositParams: DepositParams = {
    daoAddressOrEns: "0x1234567890123456789012345678901234567890", // my-dao.dao.eth
    tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
    type: TokenType.ERC1155, // "erc1155" for ERC1155 token
    tokenIds: [BigInt(1)], // token ID of the ERC-1155 token
    amounts: [BigInt(1)], // amount of the ERC-1155 token to deposit
  };
  
  // Estimate how much gas the transaction will cost.
  const estimatedGas: GasFeeEstimation = await client.estimation.deposit(
    depositParams,
  );
  console.log({ avg: estimatedGas.average, max: estimatedGas.max });
  
  // Deposit the ERC1155 tokens.
  const steps = client.methods.deposit(depositParams);
  for await (const step of steps) {
    try {
      switch (step.key) {
        case DaoDepositSteps.DEPOSITING:
          console.log({ depositingTxHash: step.txHash });
          break;
        case DaoDepositSteps.DONE:
          console.log({ tokenId: step.tokenIds, amount: step.amounts });
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
    depositingTxHash: "0xb1c14a49...3e8620b0f5832d61c"
  }
  {
    tokenIds: [1n],
    amounts: [1n]
  }
  ```
  */
  