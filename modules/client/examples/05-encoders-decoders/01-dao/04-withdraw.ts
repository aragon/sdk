/* MARKDOWN
---
title: Withdraw Tokens
---

## Withdraw Tokens From a DAO Vault

Withdraws ETH from a DAO's vault and transfers them to another address.
In order for a withdrawal to be successful, the address executing it must have `WITHDRAW` permissions.

### Encoding

#### Native Tokens
*/

import {
  Client,
  DaoAction,
  TokenType,
  WithdrawParams
} from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const withdrawParams: WithdrawParams = {
  type: TokenType.NATIVE, // "native" for ETH, otherwise use "ERC20" for ERC20 tokens and pass it the contract address of the ERC20 token
  amount: BigInt(10), // the amount in wei to withdraw
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

// Withdraws ETH from a given DAO and transfers them to another address.
const ethWithdraw: DaoAction = await client.encoding.withdrawAction(
  withdrawParams
);
console.log({ ethWithdraw });

/* MARKDOWN
---
title: Withdraw ERC-20
---

## ERC-20 Withdrawal

Encodes the action for withdrawing ERC-20 tokens from a DAO's vault upon a proposal approval.
*/

const withdrawParams: WithdrawParams = {
  type: TokenType.ERC20,
  amount: BigInt(10), // amount  in wei
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERC20 token's address to withdraw
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

const erc20WithdrawAction: DaoAction = await client.encoding.withdrawAction(
  withdrawParams
);
console.log({ erc20WithdrawAction });

/* MARKDOWN
---
title: Withdraw ERC-721
---

## Withdraws ERC-721 Tokens

Withdraws ERC-721 tokens from the DAO when a proposal passes.
*/



const withdrawParams: WithdrawParams = {
  type: TokenType.ERC721,
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERFC721's token contract address to withdraw
  amount: BigInt(10), // amount of tokens to withdraw
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

const nftWithdrawAction: DaoAction = await client.encoding.withdrawAction(
  withdrawParams
);
console.log({ nftWithdrawAction });

/* MARKDOWN
### Decoding

Decodes the parameters of a withdraw action of any token type.
*/


// Decodes the withdraw action.
const withdraw: WithdrawParams = client.decoding.withdrawAction(data);
console.log({ withdraw });

/* MARKDOWN
Returns:

```json
{
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: 10n,
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test"
}
```
*/
