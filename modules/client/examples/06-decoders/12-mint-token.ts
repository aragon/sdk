/* MARKDOWN
### Decode Mint Token Action (TokenVoting)

Decodes the parameters of a mint token action from the TokenVoting plugin.
*/

import {
  ContextPlugin,
  IMintTokenParams,
  TokenVotingClient
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a TokenVoting plugin client.
const tokenVotingClient = new TokenVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a mint token action.
const decodeMintTokenParams: IMintTokenParams = tokenVotingClient.decoding.mintTokenAction(data);
console.log({ decodeMintTokenParams });

/* MARKDOWN
Returns:

```json
{
  address: "0x12345...",
  amount: 10n
}
```
*/
