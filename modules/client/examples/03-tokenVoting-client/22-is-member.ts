/* MARKDOWN
---
title: Is Member
---

### Check if an address is a member of TokenVoting DAO in a specific block and plugin

The is member function receives the plugin address and the address to check as parameters and returns a boolean value.

*/

import { TokenVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the token voting client from the Aragon OSx SDK context.
const client: TokenVotingClient = new TokenVotingClient(context);

const isMember = await client.methods.isMember({
  pluginAddress: "0x2345678901234567890123456789012345678901",
  address: "0x1234567890123456789012345678901234567890",
  blockNumber: 12345678,
});

console.log(isMember);

/* MARKDOWN
    Returns:
    ```tsx
    true
    ```
    */
