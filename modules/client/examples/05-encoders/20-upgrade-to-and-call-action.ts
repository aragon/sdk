/* MARKDOWN
### Upgrade to and call action

Encodes the action of upgrading your DAO and enforcing the call.
*/

import { Client, ContextPlugin, DaoAction, UpgradeToAndCallParams } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate the general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const upgradeToAndCallParams: UpgradeToAndCallParams = {
  implementationAddress: "0x1234567890123456789012345678901234567890", // the implementation address to be upgraded to.
  data: new Uint8Array([10, 20, 130, 40])
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";

// Encodes the action of upgrading your DAO and enforcing the call.
const upgradeToAndCallAction: DaoAction = client.encoding.upgradeToAndCallAction(
  daoAddressOrEns,
  upgradeToAndCallParams
);
console.log({ upgradeToAndCallAction });

/* MARKDOWN
Returns:

```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
  ```
  */
