/* MARKDOWN
#### ETH Withdrawal

Withdraws ETH from a DAO's vault and transfers them to another address.
In order for a withdrawal to be successful, the address executing it must have `WITHDRAW` permissions.
*/

import {
  Client,
  DaoAction,
  TokenType,
  WithdrawParams
} from "@aragon/sdk-client";
import { context } from "../01-client/index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const withdrawParams: WithdrawParams = {
  type: TokenType.NATIVE, // "native" for ETH, otherwise use "ERC20" for ERC20 tokens and pass it the contract address of the ERC20 token
  amount: BigInt(10), // the amount in wei to withdraw
  recipientAddressOrEns: '0x1234567890123456789012345678901234567890' // the address to transfer the funds to
};

// Withdraws ETH from a given DAO and transfers them to another address.
const ethWithdraw: DaoAction = await client.encoding.withdrawAction(withdrawParams);
console.log({ ethWithdraw });
