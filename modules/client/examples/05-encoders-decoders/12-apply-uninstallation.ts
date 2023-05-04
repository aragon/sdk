/* MARKDOWN
---
title: Apply Uninstallation
---

## Apply a Plugin Uninstallation

Encodes the action of applying a plugin uninstallation.

### Encoding
*/

import {
  ApplyUninstallationParams,
  Client,
  DaoAction,
  DecodedApplyUninstallationParams,
  PermissionOperationType,
} from "@aragon/sdk-client";
import { hexToBytes } from "@aragon/sdk-common";
import { context } from "../index";
import { PermissionIds } from "../../dist/interfaces";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

// This variable contains the values received on the prepareUninstallation() method
const applyUninstallationParams: ApplyUninstallationParams = {
  permissions: [{
    condition: "0x1234567890123456789012345678901234567890",
    operation: PermissionOperationType.REVOKE,
    permissionId: hexToBytes(PermissionIds.EXECUTE_PERMISSION_ID),
    where: "0x1234567890123456789012345678901234567890",
    who: "0x2345678901234567890123456789012345678901",
  }],
  versionTag: {
    build: 1,
    release: 1,
  },
  pluginRepo: "0x2345678901234567890123456789012345678901",
  pluginAddress: "0x1234567890123456789012345678901234567890",
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123"; // "my-dao.eth"

const actions: DaoAction[] = client.encoding.applyUninstallationAction(
  daoAddressOrEns,
  applyUninstallationParams,
);
console.log(actions);

/* MARKDOWN
Returns three actions:

- Grant root permission to the Plugin Setup Processor
- Ask it to apply the uniinstallation
- Revoke the root permission to the Plugin Setup Processor

```json
[
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  },
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  },
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
]
```

### Decoding
*/

// Decodes the apply uniinstallation action for a Multisig plugin.
const decodedParams: DecodedApplyUninstallationParams = client.decoding
  .applyUninstallationAction(actions[1].data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```json
{ decodedParams:
  {
    permissions: [{
      condition: "0x1234567890123456789012345678901234567890",
      operation: 1,
      permissionId: Uint8Array([10,20,30]),
      where: "0x1234567890123456789012345678901234567890",
      who: "0x2345678901234567890123456789012345678901",
    }],
    versionTag: {
      build: 1,
      release: 1,
    },
    pluginRepo: "0x2345678901234567890123456789012345678901",
    pluginAddress: "0x1234567890123456789012345678901234567890",
    };
  }
}
```
*/
