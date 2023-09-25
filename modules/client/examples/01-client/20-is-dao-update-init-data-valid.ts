/* MARKDOWN
---
title: Check dao update init data

### Verify that the init data is correct for an specific version

*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// Get is valid init data
const isValid = await client.methods.isDaoUpdateInitDataValid(
  {
    data: new Uint8Array(),
  },
);
console.log(isValid);
/* MARKDOWN
Returns:
  ```tsx
    true
  ```
*/
