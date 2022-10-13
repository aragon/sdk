/* MARKDOWN
### Withdrawals
*/
import { Client, Context, IWithdrawParams } from "@aragon/sdk-client";
import { contextParams } from "../context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const withdrawParams: IWithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test",
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const withdrawAction = await client.encoding.withdrawAction(
  daoAddress,
  withdrawParams,
);
console.log(withdrawAction);
