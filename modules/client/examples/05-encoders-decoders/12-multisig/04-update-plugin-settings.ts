/* MARKDOWN
---
title: Update Multisig Settings
---

## Update the Multisig Plugin Settings

Allows you to update the configuration of a Multisig plugin installed in a DAO.

### Encoding
*/

import {
  MultisigVotingSettings,
  UpdateMultisigVotingSettingsParams,
} from "@aragon/sdk-client";
import { DaoAction } from "@aragon/sdk-client-common";
import { multisigClient } from "./index";

const params: UpdateMultisigVotingSettingsParams = {
  votingSettings: {
    minApprovals: 2,
    onlyListed: false,
  },
  pluginAddress: "0x0987654321098765432109876543210987654321", // the address of the Multisig plugin contract installed in the DAO
};

// Updates the voting configuration of a Multisig plugin installed in a DAO.
const action: DaoAction = multisigClient.encoding.updateMultisigVotingSettings(
  params,
);
console.log({ action });

/* MARKDOWN
Returns:

```
{ action:
  {
    to: "0x1234567890...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
}
```

### Decoding
*/

// Decodes the update settings action for a Multisig plugin.
const decodedParams: MultisigVotingSettings = multisigClient.decoding
  .updateMultisigVotingSettings(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```
{ decodedParams:
  {
    minApprovals: 2,
    onlyListed: false
  }
}
```
*/
