/* MARKDOWN
---
title: Multisig Settings
---

## Update the Multisig Plugin Settings

Allows you to update the configuration of a Multisig plugin installed in a DAO.

### Encoding
*/

import {
  ContextPlugin,
  DaoAction,
  MultisigClient,
  MultisigVotingSettings,
  UpdateMultisigVotingSettingsParams
} from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
const multisigClient = new MultisigClient(contextPlugin);

const updateMinApprovals: UpdateMultisigVotingSettingsParams = {
  votingSettings: {
    minApprovals: 2,
    onlyListed: false
  },
  pluginAddress: "0x0987654321098765432109876543210987654321" // the address of the Multisig plugin contract installed in the DAO
};

// Updates the voting configuration of a Multisig plugin installed in a DAO.
const action: DaoAction = multisigClient.encoding.updateMultisigVotingSettings(updateMinApprovals);
console.log({ action });

/* MARKDOWN
Returns:

```
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```

### Decoding
*/


// Decodes the update settings action for a Multisig plugin.
const decodedParams: MultisigVotingSettings = multisigClient.decoding.updateMultisigVotingSettings(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```
{
  minApprovals: 2,
  onlyListed: false
}
```
*/
