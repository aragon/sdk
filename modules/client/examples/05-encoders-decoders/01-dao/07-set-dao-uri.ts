/* MARKDOWN
---
title: Set DAO URI
---

## Set the DAO's URI

Encodes the action of setting the DAO's URI.
*/

import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from "../index";

// Initializes the Context pluigin from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initializes the general purpose client using the plugin's context.
const client: Client = new Client(contextPlugin);

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";

const daoUri: string = "https://the.dao/uri"; // the URI to be defined for the DAO.

const setDaoUriAction: DaoAction = client.encoding.setDaoUriAction(
  daoAddressOrEns,
  daoUri
);
console.log({ setDaoUriAction });

/* MARKDOWN
Returns:

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
title: Set DAO URI
---

## Decode the Set Dao URI Action

Decodes the action of setting a DAO's URI
*/

import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../index";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client = new Client(contextPlugin);

const setDaoUriAction = client.decoding.setDaoUriAction(new Uint8Array([0, 10, 20, 30]));
console.log({ setDaoUriAction });

/* MARKDOWN
Returns:

```
  { setDaoUriAction: "https://the.dao.uri" }
```
*/
