/* MARKDOWN
---
title: Set Signature Validator
---

## Set the Signature Validator

Encodes the action of setting the signatura validator of the DAO.
*/

import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from '../index';

// Initialize the context plugin from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize the general purpose client using the plugin's context.
const client: Client = new Client(contextPlugin);

const daoAddressOrEns: string = "0x123123123123123123123123123123123123";
const signatureValidator: string = "0x1234567890123456789012345678901234567890";

const action: DaoAction = client.encoding.setSignatureValidatorAction(
  daoAddressOrEns,
  signatureValidator
);
console.log({ action });

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
title: Set Signature Validator
---

## Decode a "Set Signature Validator" action

Decodes the action of setting a signature validator for the DAO.
*/

import { Client, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../index";

// Initialize the plugin's context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initialize general purpose client from the plugin's context.
const client: Client = new Client(contextPlugin);

const setSignatureValidatorAction = client.decoding.setSignatureValidatorAction(new Uint8Array([0, 10, 20, 30]));
console.log({ setSignatureValidatorAction });

/* MARKDOWN
Returns:

```
  { setSignatureValidatorAction: "0x1234567890123456789012345678901234567890" }
```
*/
