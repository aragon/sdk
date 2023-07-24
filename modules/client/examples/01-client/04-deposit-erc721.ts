/* MARKDOWN
---
title: Deposit ERC-721
---

### Deposit ERC-721 Tokens to a DAO

Deposits ERC-721 tokens to a DAO.

- Similar to the ERC20 deposit flow
- The `tokenAddress` field is required. This is the contract address of the ERC-721 token.
- TokenId is required. This is the token ID of the ERC-721 token.
- Calls the safeTransferFrom function of the ERC-721 token contract.
*/

import {
    Client,
    DaoDepositSteps,
    DepositParams,
    SetAllowanceSteps,
  } from "@aragon/sdk-client";
  import { GasFeeEstimation, TokenType } from "@aragon/sdk-client-common";
  import { context } from "../index";
  
  // Instantiate the general purpose client from the Aragon OSx SDK context.
  const client: Client = new Client(context);
  
  const depositParams: DepositParams = {
    daoAddressOrEns: "0x1234567890123456789012345678901234567890", // my-dao.dao.eth
    tokenAddress: "0x1234567890123456789012345678901234567890", // token contract adddress
    type: TokenType.ERC721, // "erc721" for ERC721 token
    tokenId: BigInt(1), // token ID of the ERC-721 token
  };
  
  // Estimate how much gas the transaction will cost.
  const estimatedGas: GasFeeEstimation = await client.estimation.deposit(
    depositParams,
  );
  console.log({ avg: estimatedGas.average, max: estimatedGas.max });
  
  // Deposit the ERC721 tokens.
  const steps = client.methods.deposit(depositParams);
  for await (const step of steps) {
    try {
      switch (step.key) {
        case DaoDepositSteps.DEPOSITING:
          console.log({ depositingTxHash: step.txHash });
          break;
        case DaoDepositSteps.DONE:
          console.log({ tokenId: step.tokenId });
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
    tokenId: 1n
  }
  ```
  */
  