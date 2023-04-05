/* MARKDOWN
---
title: Get Function Parameters
---

## Get function parameters from  encoded action (Addresslist)

Decodes the parameters of a function call from the Addresslist plugin.

### Encoding
*/

import { addresslistVotingClient } from "./index";

const data: Uint8Array = new Uint8Array([12, 56]);

const functionParams = addresslistVotingClient.decoding.findInterface(data);
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
