/* MARKDOWN
### Withdrawal

Withdraws assets from a given DAO and transfers them to another address.
In order for a withdrawal to be successful, the address executing it must have `WITHDRAW` permissions.
*/

import { Client, IWithdrawParams } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates an aragonOSx SDK client.
const client: Client = new Client(context);

const withdrawParams: IWithdrawParams = {
  recipientAddress: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
  tokenAddress: "0x1234567890123456789012345678901234567890", // contract address of the token to be withdrawn. if left empty, ETH will be withdrawn.
  reference: "reason for the withdrawal"
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

// Withdraws assets from a given DAO and transfers them to another address.
const withdrawAssets = await client.encoding.withdrawAction(daoAddress, withdrawParams);
console.log({ withdrawAssets });
