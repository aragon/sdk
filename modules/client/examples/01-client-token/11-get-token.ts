/* MARKDOWN
### Loading a plugin's token details
*/
import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  Erc20TokenDetails,
} from "@aragon/sdk-client";
import { Erc721TokenDetails } from "../../src/tokenVoting/interfaces";
import { contextParams } from "../00-client/00-context";

// Create a simple context
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an TokenVoting client
const client = new TokenVotingClient(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const token: Erc20TokenDetails | Erc721TokenDetails | null = await client.methods.getToken(
  pluginAddress,
);
console.log(token);
/*
  {
    address: "0x123456789000987654323112345678900987654321",
    name: "Token",
    symbol: "TOK",
    decimals: 18
  }
  or 
  {
    address: "0x123456789000987654323112345678900987654321",
    name: "Token",
    symbol: "TOK",
    baseUri: "base.uri"
  }
*/
