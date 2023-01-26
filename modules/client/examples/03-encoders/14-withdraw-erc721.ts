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
  type: WithdrawType.ERC721,
  recipientAddress: "0x1234567890123456789012345678901234567890",
  tokenAddress: "0x1234567890123456789012345678901234567890",
  reference: "test withdraw of NFT",
};
const daoAddress = "0x1234567890123456789012345678901234567890";

const withdrawAction = await client.encoding.withdrawAction(
  daoAddress,
  withdrawParams,
);
console.log(withdrawAction);
