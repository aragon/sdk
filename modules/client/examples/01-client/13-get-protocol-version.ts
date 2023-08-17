/* MARKDOWN
---
title: Get Protocol Version
---

### Get the protocol version of a DAO

The `getProtocolVersion` method returns the protocol version of a DAO in the form of an array of three numbers.
*/

import {
    Client,
  } from "@aragon/sdk-client";
  import { context } from "../index";
  
  // Instantiate the general purpose client from the Aragon OSx SDK context.
  const client: Client = new Client(context);
  
  const protocolVersion = await client.methods
    .getProtocolVersion(
      "0x1234567890123456789012345678901234567890",
    );
    console.log(protocolVersion);
  
  /* MARKDOWN
  Returns:
  ```tsx
  [1, 0, 0]
  ```
  */
  