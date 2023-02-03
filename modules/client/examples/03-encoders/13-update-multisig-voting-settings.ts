/* MARKDOWN
### Update Multisig voting confuguration

Allows you to update the voting configuration of a Multisig plugin installed in a DAO.
*/

import {
  Context,
  ContextPlugin,
  MultisigClient,
  UpdateMultisigVotingSettingsParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create an Aragon SDK context.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create a Multisig client.
const multisigClient = new MultisigClient(contextPlugin);

const updateMinApprovals: UpdateMultisigVotingSettingsParams = {
  votingSettings: {
    minApprovals: 2,
    onlyListed: false,
  },
  pluginAddress: "0x0987654321098765432109876543210987654321"
};

// Updates the voting configuration of a Multisig plugin installed in a DAO.
const updateMultisigConfig = multisigClient.encoding.updateMultisigVotingSettings(updateMinApprovals);
console.log(updateMultisigConfig);

/*
Returns:
```json
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```
*/
