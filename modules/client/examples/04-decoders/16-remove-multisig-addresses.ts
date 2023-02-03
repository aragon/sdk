/* MARKDOWN
### Decode Remove Members Action from a Multisig plugin

Decodes the parameters of the remove members action from the Multisig plugin.
*/

import {
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigPluginSettings,
} from "@aragon/sdk-client";

import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Creates a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of the remove members action from the Multisig plugin.
const decodeRemoveMemberMultisig: MultisigPluginSettings = multisigClient.decoding.removeAddressesAction(data);
console.log({ decodeRemoveMemberMultisig });

/*
Returns:
```json
{
  members: [
    "0x12345...",
    "0x56789...",
    "0x13579...",
  ],
  minApprovals: 2
}
```
*/
