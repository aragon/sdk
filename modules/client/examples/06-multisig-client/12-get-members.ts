/* MARKDOWN
### Get the list of members participating in a DAO's Multisig plugin.

Retrieves the list of addresses able to participate in a Multisig proposal for a given DAO.
*/

import {
  Context,
  ContextPlugin,
  MultisigClient,
  MultisigVotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a Multisig client
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const daoAddressorEns: string = "0x12345...";

const multisigMembers: string[] = await multisigClient.methods.getMembers(daoAddressorEns);
console.log({ multisigMembers });

/*
```json
[
  "0x1234567890...",
  "0x2345678901...",
  "0x3456789012..."
]
```
*/
