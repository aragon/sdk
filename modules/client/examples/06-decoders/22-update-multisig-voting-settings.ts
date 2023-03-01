/* MARKDOWN
#### Decodes the update settings action (Multisig).

Decodes the update settings action for a Multisig plugin.
*/

import { ContextPlugin, MultisigClient, MultisigVotingSettings } from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiate a plugin context from an Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the update settings action for a Multisig plugin.
const decodeUpdateMultisigSettings: MultisigVotingSettings = multisigClient.decoding.updateMultisigVotingSettings(data);
console.log({ decodeUpdateMultisigSettings });

/* MARKDOWN
Returns:

```json
{
  minApprovals: 2,
  onlyListed: false
}
```
*/
