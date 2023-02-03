/* MARKDOWN
### Decodes the update settings action for a Multisig plugin.

Decodes the update settings action for a Multisig plugin.
*/

import { Context, ContextPlugin, MultisigClient, MultisigVotingSettings } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK client.
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Creates a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the update settings action for a Multisig plugin.
const decodeUpdateMultisigSettings: MultisigVotingSettings = multisigClient.decoding.updateMultisigVotingSettings(data);
console.log(decodeUpdateMultisigSettings);

/*
Returns:
```json
{
  minApprovals: 2,
  onlyListed: false
}
```
*/
