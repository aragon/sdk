/* MARKDOWN
---
title: Check plugin update proposal
---

### Check if a plugin update proposal is valid

Goes though the actions of an `IProposal` compatible proposal and checks that the actions are valid for updating a plugin

*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const proposalId =
  "0x1234567890123456789012345678901234567890123456789012345678901234";

// check if a plugin update proposal is valid
const isValid = client.methods.isPluginUpdateProposalValid(proposalId);

console.log(isValid);

/* MARKDOWN
  Returns:
  ```tsx
  {
    isValid: false,
    causes: [
      "invalidRevokePermission",
      "invalidGrantPermission",
    ]
  }
  ```
  */
