/* MARKDOWN
### Decode Withdraw Action

Decodes the parameters of a withdraw action.
*/

import { Client, Context, IWithdrawParams } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Creates an Aragon SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the withdraw action.
const withdrawParams: IWithdrawParams = client.decoding.withdrawAction(data);
console.log(withdrawParams);

/*
Returns:
```json
{
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: 10n,
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test",
}
```
*/
