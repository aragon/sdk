/* MARKDOWN
---
title: Apply Uninstallation
---

## Apply a Plugin Uninstallation

Encodes the action of applying a plugin uninstallation.

### Encoding
*/

import {
  Client,
  DecodedApplyUninstallationParams,
  InitializeFromParams,
  MultisigClient,
  PermissionIds,
} from "@aragon/sdk-client";
import { DaoAction, PermissionOperationType } from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

// This variable contains the values received on the ininitializeFrom() method
const initializeFromParams: InitializeFromParams = {
  previousVersion: [1, 0, 0],
  initData: new Uint8Array([12, 34, 45]), // initialization data for the new version to be pased to upgradeToAndCall()
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123"; // "my-dao.eth"

const action: DaoAction = client.encoding.initializeFromAction(
  daoAddressOrEns,
  initializeFromParams,
);
console.log(action);

/* MARKDOWN
  ```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
  ```

  ### Decoding
  */

// Decodes the initialize from action.
const decodedParams: InitializeFromParams = client.decoding
  .initializeFromAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
  Returns:

  ```json
  { decodedParams:
    {
      permissions: [{
        operation: 1, // REVOKE
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
