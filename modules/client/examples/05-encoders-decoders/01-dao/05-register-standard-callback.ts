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
