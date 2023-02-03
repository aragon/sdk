/* MARKDOWN
### Decode Mint Token Action (TokenVoting)

Decodes the parameters of a mint token action from the TokenVoting plugin.
*/

import {
  TokenVotingClient,
  Context,
  ContextPlugin,
  IMintTokenParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a TokenVoting plugin client.
const tokenVotingClient = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a mint token action.
const decodeMintTokenParams: IMintTokenParams = tokenVotingClient.decoding.mintTokenAction(data);
console.log({ decodeMintTokenParams });

/*
Returns:
```json
{
  address: "0x12345...",
  amount: 10n
}
```
*/
