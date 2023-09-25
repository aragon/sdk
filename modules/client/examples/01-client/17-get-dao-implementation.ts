/* MARKDOWN
---
title: Get DAO implementation

### Get the dao implementation from a dao factory address

*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const daoFactoryAddress = "0x1234567890123456789012345678901234567890";

// Get dao implementation.
const daoImplementation = await client.methods.getDaoImplementation(
  daoFactoryAddress,
);
console.log(daoImplementation);
/* MARKDOWN
Returns:
    ```tsx
        0x1234567890123456789012345678901234567890
    ```
*/
