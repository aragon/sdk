/* MARKDOWN
#### ERC-20 Withdrawal

Encodes the action for withdrawing ERC-20 tokens from a DAO's vault upon a proposal approval.
*/

import {
  Client,
  DaoAction,
  TokenType,
  WithdrawParams
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a general purpose Client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const withdrawParams: WithdrawParams = {
  type: TokenType.ERC20,
  amount: BigInt(10), // amount  in wei
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERC20 token's address to withdraw
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

const erc20WithdrawAction: DaoAction = await client.encoding.withdrawAction(withdrawParams);
console.log({ erc20WithdrawAction });
