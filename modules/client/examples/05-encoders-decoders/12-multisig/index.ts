/* MARKDOWN
---
title: Multisig
---

## Actions of the Multisig Plugin

With an instance of the `MultisigClient`
*/

import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig client.
export const multisigClient = new MultisigClient(contextPlugin);

/* MARKDOWN
actions can encoded and decoded as demonstrated in the following examples.
*/
