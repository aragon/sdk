/* MARKDOWN
### Withdrawals
*/
import {
  Client,
  Context,
  WithdrawParams,
  WithdrawType,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const withdrawParams: WithdrawParams = {
  type: WithdrawType.ERC20,
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
