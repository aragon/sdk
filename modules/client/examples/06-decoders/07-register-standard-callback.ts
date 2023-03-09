/* MARKDOWN

---
title: Register Callback
---

## Decode a "Register Callback" action

Decodes the action of registering a callback.
*/

import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../index";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const registerStandardCallbackAction = client.decoding.registerStandardCallbackAction(new Uint8Array([0, 10, 20, 30]));
console.log({ registerStandardCallbackAction });

/* MARKDOWN
Returns:

```
{
  interfaceId: "0x12345678",
  callbackSelector: "0x23456789",
  magicNumber: "0x34567890"
}
```
*/
