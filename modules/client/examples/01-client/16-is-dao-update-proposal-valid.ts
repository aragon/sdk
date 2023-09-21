/* MARKDOWN
---
title: Check if a proposal valid for updating a dao
---

### Check if a proposal valid for updating a dao

It will check that the proposal has the correct actions to update a dao.
It will check that the encoded previous version matches the dao version
it will check that the implementation address matches the latest dao factory address
It will check that the init data is empty becuase the dao factory does not have new params so init data is not necessary

*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const proposalId =
  "0x1234567890123456789012345678901234567890123456789012345678901234";

// Check proposal validity.
const daoUpdateValidity = client.methods.isDaoUpdateProposalValid(proposalId);
console.log(daoUpdateValidity);
/* MARKDOWN
    Returns:
    ```tsx
    {    
        version: true,
        implementation: true,
        initData: true,
        actions: true
    }
    ```
    */
