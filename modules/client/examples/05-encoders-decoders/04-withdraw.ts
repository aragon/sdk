/* MARKDOWN
---
title: Withdraw Tokens
---

## Withdraw Tokens From a DAO Vault

:::info
This page is Work in progress.
:::

Withdraws tokens from a DAO's vault and transfers them to another address.
In order for a withdrawal to be successful, the address executing it must have `WITHDRAW` permissions.

### Native Tokens

#### Encoding
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

let params: WithdrawParams = {
  type: TokenType.NATIVE, // "native" for ETH, otherwise use "ERC20" or "ERC721" for ERC-20 or ERC-721 Tokens,
  amount: BigInt(10), // the amount in wei to withdraw
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

// Withdraws ETH from a given DAO and transfers them to another address.
const nativeWithdrawAction: DaoAction = await client.encoding.withdrawAction(
  params
);
console.log({ nativeWithdrawAction });

/* MARKDOWN
#### Decoding
*/

// Decodes the withdraw action.
let decodedParams: WithdrawParams = client.decoding.withdrawAction(
  nativeWithdrawAction.data
);
console.log({ decodedParams });

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

/* MARKDOWN
### ERC-20 Tokens

#### Encoding
*/

params = {
  type: TokenType.ERC20,
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERC20 token's address
  amount: BigInt(10), // the amount ignoring the decimals
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

const erc20WithdrawAction: DaoAction = await client.encoding.withdrawAction(
  params
);
console.log({ erc20WithdrawAction });

/* MARKDOWN
#### Decoding
*/

decodedParams = client.decoding.withdrawAction(erc20WithdrawAction.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

:::info
Work in progress.
:::
*/

/* MARKDOWN
### NFT (ERC-721) Tokens

#### Encoding

:::info
Work in progress.
:::
*/

params = {
  type: TokenType.ERC721, // TODO!!
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERFC721's token contract address
  amount: BigInt(10), // TODO!!
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

const nftWithdrawAction: DaoAction = await client.encoding.withdrawAction(
  params
);
console.log({ nftWithdrawAction });

/* MARKDOWN
#### Decoding

:::info
Work in progress.
:::
*/

decodedParams = client.decoding.withdrawAction(nftWithdrawAction.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

:::info
Work in progress.
:::
*/
