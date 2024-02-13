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

import { Client, WithdrawParams } from "@aragon/sdk-client";
import { DaoAction, TokenType } from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

let params: WithdrawParams = {
  type: TokenType.NATIVE, // "native" for ETH, otherwise use "ERC20" or "ERC721" for ERC-20 or ERC-721 Tokens,
  amount: BigInt(10), // the amount in wei to withdraw
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890", // the address to transfer the funds to
};

// Withdraws ETH from a given DAO and transfers them to another address.
const nativeWithdrawAction: DaoAction = await client.encoding.withdrawAction(
  params,
);
console.log({ nativeWithdrawAction });

/* MARKDOWN
Returns:

```json
{ nativeWithdrawAction:
  {
    to: "0x1234567890...",
    value: 0n;
    data: Uint8Array[12,34,45...]
  }
}
```
#### Decoding
*/

// Decodes the withdraw action.
const nativeDecodedParams: WithdrawParams = client.decoding.withdrawAction(
  nativeWithdrawAction.to,
  nativeWithdrawAction.value,
  nativeWithdrawAction.data,
);
console.log({ nativeDecodedParams });

/* MARKDOWN
Returns:

```json
{ nativeDecodedParams:
  {
    type: "native",
    recipientAddressOrEns: "0x1234567890123456789012345678901234567890",
    amount: 10n,
  }
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
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890", // the address to transfer the funds to
};

const erc20WithdrawAction: DaoAction = await client.encoding.withdrawAction(
  params,
);
console.log({ erc20WithdrawAction });

/* MARKDOWN
Returns:

```json
{ erc20WithdrawAction:
  {
    to: "0x1234567890...",
    value: 0n;
    data: Uint8Array[12,34,45...]
  }
}
```

#### Decoding
*/

const erc20DecodedParams = client.decoding.withdrawAction(
  erc20WithdrawAction.to,
  erc20WithdrawAction.value,
  erc20WithdrawAction.data,
);
console.log({ erc20DecodedParams });

/* MARKDOWN
Returns:

```
{ erc20DecodedParams:
  {
    type: "erc20",
    recipientAddressOrEns: "0x1234567890123456789012345678901234567890",
    amount: 10n,
    tokenAddress: "0x1234567890123456789012345678901234567890",
  }
}
```
*/

/* MARKDOWN
### NFT (ERC-721) Tokens

#### Encoding

*/

params = {
  type: TokenType.ERC721,
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERFC721's token contract address
  tokenId: BigInt(10),
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890", // the address to transfer the funds to
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // the address of the DAO
};

const erc721WithdrawAction: DaoAction = await client.encoding.withdrawAction(
  params,
);
console.log({ erc721WithdrawAction });

/* MARKDOWN
#### Decoding

*/

const erc721DecodedParams = client.decoding.withdrawAction(
  erc721WithdrawAction.to,
  erc721WithdrawAction.value,
  erc721WithdrawAction.data,
);
console.log({ erc721DecodedParams });

/* MARKDOWN
Returns:
```
{
  type: TokenType.ERC721;
  tokenAddress: "0x1234567890123456789012345678901234567890";
  tokenId: 10n;
  daoAddressOrEns: "0x1234567890123456789012345678901234567890";
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890";
}
```
*/
/* MARKDOWN
### NFT (ERC-1155) Tokens

#### Encoding

*/

params = {
  type: TokenType.ERC1155,
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERFC721's token contract address
  tokenIds: [BigInt(10)], // array of token ids
  amounts: [BigInt(20)], // array of amounts
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890", // the address to transfer the funds to
  daoAddressOrEns: "0x1234567890123456789012345678901234567890", // the address of the DAO
};

const erc1155WithdrawAction: DaoAction = await client.encoding.withdrawAction(
  params,
);
console.log({ erc1155WithdrawAction });

/* MARKDOWN
#### Decoding

*/

const erc1155WithdrawDecodedParams = client.decoding.withdrawAction(
  erc1155WithdrawAction.to,
  erc1155WithdrawAction.value,
  erc1155WithdrawAction.data,
);
console.log({ erc1155WithdrawDecodedParams });

/* MARKDOWN
Returns:
```
{
  type: TokenType.ERC1155,
  tokenAddress: "0x1234567890123456789012345678901234567890",
  tokenIds: [10n],
  amounts: [20n],
  daoAddressOrEns: "0x1234567890123456789012345678901234567890",
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890",
}
```
*/
