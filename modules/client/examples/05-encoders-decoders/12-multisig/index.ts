/* MARKDOWN
---
title: Multisig
---

## Actions of the Multisig Plugin

With an instance of the `MultisigClient`
*/

import { MultisigClient } from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiate a Multisig client.
export const multisigClient = new MultisigClient(context);

/* MARKDOWN
actions can encoded and decoded as demonstrated in the following examples.
*/
