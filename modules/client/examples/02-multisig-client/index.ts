/* MARKDOWN
---
title: Multisig Client
---

## Create a Multisig Client

Creating a Multisig plugin Client allows you to access the Multisig plugin from your DAO.
In order to interact with the Multisig plugin, you need to create a `MultisigClient`. This is created using the `ContextPlugin`.
*/

import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../index";

// Create a plugin context from the Aragon OSx SDK context.


// Creates a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(context);
console.log(multisigClient);
