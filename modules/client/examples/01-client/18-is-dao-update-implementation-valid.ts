/* MARKDOWN
---
title: Check dao update implementation

### Verify that the implementation address is correct for an specific version

*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";
import { SupportedVersion } from "@aragon/sdk-client-common";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// check is valid implementation
const isValid = await client.methods.isDaoUpdateImplementationValid(
  {
    version: SupportedVersion.V1_0_0,
    implementationAddress: "0x1234567890123456789012345678901234567890",
  },
);
console.log(isValid);
/* MARKDOWN
Returns:
  ```tsx
    true
  ```
*/
