/* MARKDOWN
### Decode Add Members Action in a Multisig plugin

Decodes the parameters of the add members action from the Multisig plugin.
*/

import { Context, ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { MultisigPluginSettings } from "../../src";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the simple context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Creates a Multisig plugin client.
const multisigClient = new MultisigClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const decodeAddMembersMultisig: MultisigPluginSettings = multisigClient.decoding.addAddressesAction(data);
console.log({ decodeAddMembersMultisig });

/*
Returns:
```json
  [
    "0x12345...",
    "0x56789...",
    "0x13579...",
  ]
```
*/
