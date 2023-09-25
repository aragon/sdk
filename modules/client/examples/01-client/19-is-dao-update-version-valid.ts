/* MARKDOWN
---
title: Check dao update version

### Verify that the version of the dao matches the specified version

*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// check is valid version
const isValid = await client.methods.isDaoUpdateVersionValid(
  {
    previousVersion: [1, 0, 0],
    daoAddress: "0x1234567890123456789012345678901234567890",
  },
);
console.log(isValid);
/* MARKDOWN
Returns:
  ```tsx
    true
  ```
*/
