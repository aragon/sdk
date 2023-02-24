/* MARKDOWN
### Set the signature validator

Encodes the action of setting the signatura validator of the DAO.
*/

import { Client, ContextPlugin, DaoAction } from "@aragon/sdk-client";
import { context } from '../00-setup/00-getting-started';

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
