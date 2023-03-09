/* MARKDOWN
---
title: Upgrade To
---

## Upgrade the DAO 

Encodes the action of upgrading the DAO proxy contract to a new implementation address.
*/

import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from "../index";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";
const implementationAddress: string = "0x1234567890123456789012345678901234567890";

const upgradeToAction: DaoAction = client.encoding.upgradeToAction(
  daoAddressOrEns,
  implementationAddress
);
console.log({ upgradeToAction });

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
title: Upgrade To
---

## Decode an "Upgrade To" action

Decodes the action of upgrading the DAO to a new implementation.
*/

import { Client, Context, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../index";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const upgradeToAction = client.decoding.upgradeToAction(new Uint8Array([0, 10, 20, 30]));
console.log({ upgradeToAction });

/* MARKDOWN
Returns:

```
  { upgradeToAction: "0x1234567890123456789012345678901234567890" }
```
*/
