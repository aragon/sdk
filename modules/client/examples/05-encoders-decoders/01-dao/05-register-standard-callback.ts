/* MARKDOWN
---
title: Register Callback
---

## Register a New Standard Callback

Register a new standard callback for the DAO.

### Encoding
*/

import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from "../../index";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize the general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const params = {
  interfaceId: "0x3134r1er213740123741207831238410972347",
  callbackSelector: "0x382741239807410892375182734892",
  magicNumber: "0x12192304781237401321329450123321"
};

const dao: string = "0x123123123123123123123123123123123123";

const action: DaoAction = client.encoding.registerStandardCallbackAction(
  dao,
  params
);
console.log({ action });

/* MARKDOWN

```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```
*/

/* MARKDOWN
### Decoding
*/

const decodedParams = client.decoding.registerStandardCallbackAction(
  action.data
);
console.log({ decodedParams });

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
