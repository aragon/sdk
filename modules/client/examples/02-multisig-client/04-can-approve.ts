/* MARKDOWN
---
title: Check Approval Rights
---

## Check if a User Can Approve in a Multisig Proposal

Checks whether a user is able to participate in a proposal created using the Multisig plugin.
*/

import { CanApproveParams, MultisigClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate a Multisig client.
const client: MultisigClient = new MultisigClient(context);

const canApproveParams: CanApproveParams = {
  approverAddressOrEns: "0x1234567890123456789012345678901234567890",
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
};

// Checks whether the addressOrEns provided is able to approve a given proposal created with the pluginAddress.
const canApprove = await client.methods.canApprove(canApproveParams);
console.log(canApprove);

/* MARKDOWN
Returns:

```
  true
```
*/
