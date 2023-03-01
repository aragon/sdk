/* MARKDOWN
#### Decode the Set Dao URI action

Decodes the action of setting a DAO's URI
*/

import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client = new Client(contextPlugin);

const setDaoUriAction = client.decoding.setDaoUriAction(new Uint8Array([0, 10, 20, 30]));
console.log({ setDaoUriAction });

/* MARKDOWN
Returns:

```json
  { setDaoUriAction: "https://the.dao.uri" }
```
*/
