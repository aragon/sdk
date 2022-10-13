/* MARKDOWN
### Decode Withdraw Action
*/
import { Client, Context, IWithdrawParams } from "@aragon/sdk-client";
import { contextParams } from "../context";
const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: IWithdrawParams = client.decoding.withdrawAction(data);

console.log(params);
/*
{
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: 10n,
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test",
}
*/
