/* MARKDOWN
#### Decode a "Set Signature Validator" action

Decodes the action of setting a signature validator for the DAO.
*/

import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/index";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const setSignatureValidatorAction = client.decoding.setSignatureValidatorAction(new Uint8Array([0, 10, 20, 30]));
console.log({ setSignatureValidatorAction });

/* MARKDOWN
Returns:

```
  { setSignatureValidatorAction: "0x1234567890123456789012345678901234567890" }
```
*/
