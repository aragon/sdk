/* MARKDOWN
---
title: Withdraw
---

## Decode Withdraw Action

Decodes the parameters of a withdraw action of any token type.
*/

import { Client, WithdrawParams } from "@aragon/sdk-client";
import { context } from "../index";

// Insantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

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
