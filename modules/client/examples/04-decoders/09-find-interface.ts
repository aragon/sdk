/* MARKDOWN
### Get Function Parameters from an encoded action

Decodes the parameters of a function call.
*/

import { Client, Context } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Creates an Aragon SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a function call.
const functionParams = client.decoding.findInterface(data);
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
