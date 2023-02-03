/* MARKDOWN
### Withdrawal

Withdraws assets from a given DAO and transfers them to another address.
In order for a withdrawal to be successful, the address executing it must have `WITHDRAW` permissions.
*/

import { Client, Context, IWithdrawParams } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Creates an Aragon SDK client.
const client: Client = new Client(context);

const withdrawParams: IWithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "reason for the withdrawal"
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

// Withdraws assets from a given DAO and transfers them to another address.
const withdrawAssets = await client.encoding.withdrawAction(daoAddress, withdrawParams);
console.log({ withdrawAssets });
