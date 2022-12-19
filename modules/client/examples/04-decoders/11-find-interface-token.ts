/* MARKDOWN
### Get Function Parameters from an encoded action (Token)
*/
import { ClientToken, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
const client = new ClientToken(contextPlugin);

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
