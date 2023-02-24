/* MARKDOWN
### ERC-721 Withdraws

Withdraws ERC-721 tokens from the DAO when a proposal passes.
*/
import {
  Client,
  DaoAction,
  WithdrawParams,
  WithdrawType
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a general purpose client for Aragon OSx SDK context.
const client: Client = new Client(context);

const withdrawParams: WithdrawParams = {
  type: WithdrawType.ERC721,
  recipientAddress: "0x1234567890123456789012345678901234567890",
  tokenAddress: "0x1234567890123456789012345678901234567890", // token contract address to withdraw
  reference: "test withdraw of NFT"
};

const daoAddress: string = "0x1234567890123456789012345678901234567890";

const nftWithdrawAction: DaoAction = await client.encoding.withdrawAction(
  daoAddress,
  withdrawParams
);
console.log({ nftWithdrawAction });
