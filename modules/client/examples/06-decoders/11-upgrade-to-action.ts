/* MARKDOWN
#### Decode an "Upgrade To" action

Decodes the action of upgrading the DAO to a new implementation.
*/

import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const upgradeToAction = client.decoding.upgradeToAction(new Uint8Array([0, 10, 20, 30]));
console.log({ upgradeToAction });

/* MARKDOWN
Returns:

```json
  { upgradeToAction: "0x1234567890123456789012345678901234567890" }
```
*/
