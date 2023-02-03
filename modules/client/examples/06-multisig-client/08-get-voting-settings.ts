/* MARKDOWN
### Get the voting settings of a Multisig plugin

Retrieves the settings of a Multisig plugin from a DAO.
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
// Create a Multisig client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const daoAddressorEns: string = "0x12345...";

const multisigSettings: MultisigVotingSettings = await multisigClient.methods.getVotingSettings(daoAddressorEns);
console.log({ multisigSettings });

/*
Returns:
```json
{
  votingSettings: {
    minApprovals: 4,
    onlyListed: true
  }
}
```
*/
