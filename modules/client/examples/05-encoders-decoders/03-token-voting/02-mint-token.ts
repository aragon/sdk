/* MARKDOWN
---
title: Mint Tokens
---

## Mint Vote Tokens for the TokenVoting Plugin

Mints vote tokens for an installed TokenVoting plugin.

### Encoding
*/

import {
  ContextPlugin,
  DaoAction,
  IMintTokenParams,
  TokenVotingClient
} from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a TokenVoting client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const params: IMintTokenParams = {
  address: "0x1234567890123456789012345678901234567890", // address which will receive the minted tokens
  amount: BigInt(10) // amount of tokens they will receive
};

const minterAddress: string = "0x0987654321098765432109876543210987654321"; // the contract address of the token to mint

const action: DaoAction = tokenVotingClient.encoding.mintTokenAction(minterAddress, params);
console.log({ action });

/* MARKDOWN
Returns:

```json
{
  to: "0x0987654321098765432...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

### Decoding
*/

// Decodes the parameters of a mint token action.
const decodedParams: IMintTokenParams = tokenVotingClient.decoding.mintTokenAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```json
{
  address: "0x12345...",
  amount: 10n
}
```
*/
