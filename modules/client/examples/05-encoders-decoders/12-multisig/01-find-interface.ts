/* MARKDOWN
---
title: Get Function Parameters
---

## Get Function Parameters from an Encoded Action

Decodes the parameters of a function call from the Multisig plugin contract.

### Decoding
*/

import { multisigClient } from "./index";

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of a function call from the Multisig plugin.
const functionParams = multisigClient.decoding.findInterface(data);
console.log(functionParams);

/* MARKDOWN
Returns:

```
{
  id: "function functionName(param1, param2)"
  functionName: "functionName"
  hash: "0x12345678"
}
```
*/
