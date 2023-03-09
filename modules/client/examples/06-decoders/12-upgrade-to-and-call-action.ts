/* MARKDOWN
---
title: Upgrade To and Call
---

## Decode an "Upgrade To and Call" action

Decodes the action of upgrading the DAO to a new implementation and calling a function within it.
*/

import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../index";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const upgradeToAndCallAction = client.decoding.upgradeToAndCallAction(new Uint8Array([10, 20, 30, 40]));
console.log({ upgradeToAndCallAction });

/* MARKDOWN
Returns:

```
  {
    implementationAddress: "0x1234567890...",
    data: Uint8Array[12,34,45...]
  }
```
*/
