/* MARKDOWN
#### Get function parameters from  encoded action (Addresslist)

Decodes the parameters of a function call from the Addresslist plugin.
*/

import {
  AddresslistVotingClient,
  ContextPlugin
} from "@aragon/sdk-client";
import { context } from "../01-client/index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an Addresslist plugin client.
const client: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const functionParams = client.decoding.findInterface(data);
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
