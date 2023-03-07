/* MARKDOWN
#### Get Function Parameters from an encoded action (TokenVoting)

Decodes the parameters of a function call from the TokenVoting plugin contract.
*/

import { ContextPlugin, TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a TokenVoting plugin client.
const tokenVotingClient: TokenVotingClient = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a function call from the TokenVoting plugin.
const functionParams = tokenVotingClient.decoding.findInterface(data);
console.log({ functionParams });

/* MARKDOWN
Returns:

```
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
```
*/
