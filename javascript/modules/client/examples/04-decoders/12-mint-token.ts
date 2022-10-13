/* MARKDOWN
### Decode Mint Token Action (ERC-20)
*/
import {
  ClientErc20,
  Context,
  ContextPlugin,
  IMintTokenParams,
} from "@aragon/sdk-client";
import { contextParams } from "../context";
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const clientErc20 = new ClientErc20(contextPlugin);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: IMintTokenParams = clientErc20.decoding.mintTokenAction(data);

console.log(params);
/*
{
  address: "0x12345...",
  amount: 10n
}
*/
