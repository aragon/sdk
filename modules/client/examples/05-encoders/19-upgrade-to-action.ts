/* MARKDOWN
### Upgrade to action

Encodes the action of upgrading into a new implementation address.
*/

import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";
const implementationAddress: string = "0x1234567890123456789012345678901234567890";

const upgradeToAction: DaoAction = client.encoding.upgradeToAction(
  daoAddressOrEns,
  implementationAddress
);
console.log({ upgradeToAction });

/* MARKDOWN

```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
  ```
  */
