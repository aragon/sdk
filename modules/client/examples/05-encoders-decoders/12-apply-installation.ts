/* MARKDOWN
---
title: Apply Installation
---

## Apply a Plugin Installation

Encodes the action of applying a plugin installation.

### Encoding
*/


import { Client, DaoAction, ApplyInstallationParams, DecodedApplyInstallationParams } from "@aragon/sdk-client";
import { hexToBytes } from "@aragon/sdk-common";
import { context } from "../index";
import { PermissionIds } from "../../dist/interfaces";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);


  // This variable contains the values received on the prepareInstallation() method
const applyInstallationParams: ApplyInstallationParams = {
  helpers: [
      "0x1234567890123456789012345678901234567890",
      "0x2345678901234567890123456789012345678901",
      "0x3456789012345678901234567890123456789012",
      "0x4567890123456789012345678901234567890123",
      "0x5678901234567890123456789012345678901234",
    ],
    permissions: [{
      condition: "0x1234567890123456789012345678901234567890",
      operation: 1,
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

const action: DaoAction = client.encoding.applyInstallationAction(
  daoAddressOrEns,
  applyInstallationParams
);
console.log({ action });

/* MARKDOWN
Returns:

```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
  ```
  */


  /* MARKDOWN
### Decoding
*/

// Decodes the update settings action for a Multisig plugin.
const decodedParams: DecodedApplyInstallationParams = client.decoding
  .applyInstallationAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
Returns:

```json
{
  helpers: [
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
        "0x4567890123456789012345678901234567890123",
        "0x5678901234567890123456789012345678901234",
      ],
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
```
*/
