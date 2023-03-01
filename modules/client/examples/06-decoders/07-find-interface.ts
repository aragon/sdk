/* MARKDOWN
#### Get function parameters from an encoded action

Decodes the parameters of a function call.
*/

import { Client } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a function call.
const functionParams = client.decoding.findInterface(data);
console.log({ functionParams });

/* MARKDOWN
Returns:

```json
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
```
*/
