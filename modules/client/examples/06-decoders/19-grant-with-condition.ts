/* MARKDOWN
### Decode the "Grant with Condition" Action

Decodes the action of granting a permission based on a condition.
*/

import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const grantWithConditionAction = client.decoding.grantWithConditionAction(new Uint8Array([0, 10, 20, 30]));
console.log({ grantWithConditionAction });

/* MARKDOWN
Returns:

```json
  {
  where: "0x1234567890...",
  who: "0x2345678901...",
  permission: "UPGRADE_PERMISSION"
  condition: "0x3456789012..."
  permissionId: "0x12345..."
  }
  ```
  */
