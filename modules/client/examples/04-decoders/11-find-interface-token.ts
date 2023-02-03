/* MARKDOWN
### Get Function Parameters from an encoded action from the TokenVoting plugin

Decodes the parameters of a function call from the TokenVoting plugin contract.
*/
import { TokenVotingClient, Context, ContextPlugin } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Creates a TokenVoting plugin client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a function call from the TokenVoting plugin.
const functionParams = tokenVotingClient.decoding.findInterface(data);
console.log({ functionParams });

/*
Returns:
```json
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
```
*/
