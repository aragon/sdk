/* MARKDOWN
### Mint Token (ERC-20)
*/
import {
  ClientErc20,
  Context,
  ContextPlugin,
  IMintTokenParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new ClientErc20(contextPlugin);

const params: IMintTokenParams = {
  address: "0x1234567890123456789012345678901234567890",
  amount: BigInt(10),
};

const minterAddress = "0x0987654321098765432109876543210987654321";
const action = client.encoding.mintTokenAction(minterAddress, params);
console.log(action);
/*
{
  to: "0x0987654321098765432...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
*/
