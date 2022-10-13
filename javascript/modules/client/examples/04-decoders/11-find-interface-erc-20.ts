/* MARKDOWN
### Get Function Parameters from an encoded action (ERC-20)
*/
import { ClientErc20, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../context";

const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new ClientErc20(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const functionParams = client.decoding.findInterface(data);

console.log(functionParams);

/*
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
*/
