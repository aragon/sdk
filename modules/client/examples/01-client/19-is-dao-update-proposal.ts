/* MARKDOWN
---
title: Check proposal is a dao update proposal
---

### Check if a proposal contains the actions required to update a dao

Goes though a list of actions and checks that contains the necessary actions for updating a dao
*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";
import { DaoAction } from "@aragon/sdk-client-common";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const actions: DaoAction[] = [
  {
    to: "0x1234567890123456789012345678901234567890",
    value: BigInt(0),
    data: new Uint8Array([10, 20, 30]),
  },
];

// check if a plugin update proposal is valid
const isValid = client.methods.isDaoUpdateProposal(actions);

console.log(isValid);

/* MARKDOWN
  Returns:
  ```tsx
  false
  ```
  */
