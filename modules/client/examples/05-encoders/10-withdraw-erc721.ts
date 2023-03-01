/* MARKDOWN
#### ERC-721 Withdraws

Withdraws ERC-721 tokens from the DAO when a proposal passes.
*/
import {
  Client,
  DaoAction,
  TokenType,
  WithdrawParams
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a general purpose client for Aragon OSx SDK context.
const client: Client = new Client(context);

// Coming Soon
const withdrawParams: WithdrawParams = {
  type: TokenType.ERC721,
  tokenAddress: "0x1234567890123456789012345678901234567890", // ERFC721's token contract address to withdraw
  amount: BigInt(10), // amount of tokens to withdraw
  recipientAddressOrEns: "0x1234567890123456789012345678901234567890" // the address to transfer the funds to
};

const nftWithdrawAction: DaoAction = await client.encoding.withdrawAction(withdrawParams);
console.log({ nftWithdrawAction });
