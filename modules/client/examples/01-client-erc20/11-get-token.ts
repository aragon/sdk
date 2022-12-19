/* MARKDOWN
### Loading a plugin's token details
*/
import {
  ClientToken,
  Context,
  ContextPlugin,
  TokenTokenDetails,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an Token client
const client = new ClientToken(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const token: TokenTokenDetails | null = await client.methods.getToken(
  pluginAddress,
);
console.log(token);
/*
  {
    address: "0x123456789000987654323112345678900987654321",
    name: "Token",
    decimals: 18,
    symbol: "TOK"
  }
*/
