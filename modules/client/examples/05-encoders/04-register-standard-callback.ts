/* MARKDOWN
---
title: Register Callbacks
---

## Register a New Standard Callback

Encodes the action of registering a new standard callback for the DAO.
*/

import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from '../index';

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize the general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const registerStandardCallbackParams = {
  interfaceId: "0x3134r1er213740123741207831238410972347",
  callbackSelector: "0x382741239807410892375182734892",
  magicNumber: "0x12192304781237401321329450123321"
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";

const registerStandardCallbackAction: DaoAction = client.encoding.registerStandardCallbackAction(
  daoAddressOrEns,
  registerStandardCallbackParams
);
console.log({ registerStandardCallbackAction });

/* MARKDOWN

```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```
*/
