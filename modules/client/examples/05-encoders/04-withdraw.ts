/* MARKDOWN
### ETH Withdrawal

Withdraws ETH from a DAO's vault and transfers them to another address.
In order for a withdrawal to be successful, the address executing it must have `WITHDRAW` permissions.
*/

import {
  Client,
  DaoAction,
  WithdrawParams
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates an aragonOSx SDK client.
const client: Client = new Client(context);

const withdrawParams: WithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
  reference: "test reference"
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

// Withdraws ETH from a given DAO and transfers them to another address.
const ethWithdraw: DaoAction = await client.encoding.withdrawAction(daoAddress, withdrawParams);
console.log({ ethWithdraw });
