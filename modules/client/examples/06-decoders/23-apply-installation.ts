/* MARKDOWN
#### Decodes apply installation.

*/

import { Client, DecodedApplyInstallationParams } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a Multisig plugin client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the update settings action for a Multisig plugin.
const applyInstallationParams: DecodedApplyInstallationParams = client.decoding
  .applyInstallation(data);
console.log({ applyInstallationParams });

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
